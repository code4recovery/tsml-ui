import { useSettings } from '../helpers';
import { loadingCss } from '../styles';

export default function Loading() {
  const { strings } = useSettings();
  return (
    <div
      aria-busy="true"
      aria-label={strings.loading}
      css={loadingCss}
      role="progressbar"
    >
      <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
