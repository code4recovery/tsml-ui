// TODO: Do unions for TZ, meeting type, lang exist somewhere already?
interface TSMLReactConfig {
  readonly timezone?: string;
  // TODO: Took from the README example, need help organizing this :)
  readonly strings?: Record<string, Record<'types', Record<string, string>>>;
}

declare var tsml_react_config: TSMLReactConfig;
