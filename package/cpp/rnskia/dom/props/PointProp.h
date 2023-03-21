#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkPoint.h"

#include <memory>
#include <utility>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>
#include <SkPoint3.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameX = JsiPropId::get("x");
static PropId PropNameY = JsiPropId::get("y");
static PropId PropNameZ = JsiPropId::get("z");

class PointProp : public DerivedProp<SkPoint> {
public:
  explicit PointProp(PropId name,
                     const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkPoint>(onChange) {
    _pointProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_pointProp->isSet()) {
      // Check for JsiSkRect and JsiSkPoint
      setDerivedValue(std::move(processValue(_pointProp->value())));
    } else {
      setDerivedValue(nullptr);
    }
  }

  static SkPoint processValue(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      // Try reading as point
      auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(value.getAsHostObject());
      if (ptr != nullptr) {
        return SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y());
      } else {
        // Try reading as rect
        auto ptr =
            std::dynamic_pointer_cast<JsiSkRect>(value.getAsHostObject());
        if (ptr != nullptr) {
          return SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y());
        }
      }
    } else if (value.getType() == PropType::Object &&
               value.hasValue(PropNameX) && value.hasValue(PropNameY)) {
      auto x = value.getValue(PropNameX);
      auto y = value.getValue(PropNameY);
      return SkPoint::Make(x.getAsNumber(), y.getAsNumber());
    }
    throw std::runtime_error("Expected point value.");
  }

private:
  NodeProp *_pointProp;
};

class Point3Prop : public DerivedProp<SkPoint3> {
public:
  explicit Point3Prop(PropId name,
                      const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkPoint3>(onChange) {
    _pointProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_pointProp->isSet()) {
      // Check for JsiSkRect and JsiSkPoint
      setDerivedValue(std::move(processValue(_pointProp->value())));
    } else {
      setDerivedValue(nullptr);
    }
  }

  static SkPoint3 processValue(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      // Try reading as point
      auto ptr =
          std::dynamic_pointer_cast<JsiSkPoint3>(value.getAsHostObject());
      if (ptr != nullptr) {
        return SkPoint3::Make(ptr->getObject()->x(), ptr->getObject()->y(),
                              ptr->getObject()->z());
      }
    } else if (value.getType() == PropType::Object &&
               value.hasValue(PropNameX) && value.hasValue(PropNameY) &&
               value.hasValue(PropNameZ)) {
      auto x = value.getValue(PropNameX);
      auto y = value.getValue(PropNameY);
      auto z = value.getValue(PropNameZ);
      return SkPoint3::Make(x.getAsNumber(), y.getAsNumber(), z.getAsNumber());
    }
    throw std::runtime_error("Expected point value.");
  }

private:
  NodeProp *_pointProp;
};

} // namespace RNSkia
