import { AbstractStatelessDataModel } from "./AbstractStatelessDataModel";
import { AbstractStatefulDataModel } from "./AbstractStatefulDataModel";
import { DataModelTransformerConfig } from "./types";

export function composeStatelessValidator<T extends Record<string, any>>(
  model: AbstractStatelessDataModel<T>,
  config: DataModelTransformerConfig<T>,
): AbstractStatelessDataModel<T> {
  if (config.beforeValidate) {
    for (const [path, fns] of Object.entries(config.beforeValidate)) {
      if (!fns) continue;
      for (const fn of fns as any[]) {
        model.addValueTransformer(path as any, {
          trigger: "beforeValidate",
          handler: fn as any,
        });
      }
    }
  }

  if (config.afterValidate) {
    for (const [path, fns] of Object.entries(config.afterValidate)) {
      if (!fns) continue;
      for (const fn of fns as any[]) {
        model.addValueTransformer(path as any, {
          trigger: "afterValidate",
          handler: fn as any,
        });
      }
    }
  }

  return model;
}

export function composeStatefulModel<T extends Record<string, any>>(
  model: AbstractStatefulDataModel<T>,
  config: DataModelTransformerConfig<T>,
): AbstractStatefulDataModel<T> {
  // Since AbstractStatefulDataModel extends AbstractStatelessDataModel,
  // we can just reuse the stateless composition logic.
  composeStatelessValidator(model, config);
  return model;
}
