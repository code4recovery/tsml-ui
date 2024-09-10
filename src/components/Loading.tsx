import { loadingCss } from '../styles';

export default function Loading() {
  return (
    <div css={loadingCss}>
      <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
