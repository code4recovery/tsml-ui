import { buttonCss } from '../styles';
import Icon, { icons } from './Icon';

type ButtonProps = {
  href?: string;
  icon?: keyof typeof icons;
  onClick?: () => void;
  text?: string;
};

export default function Button({ href, icon, onClick, text }: ButtonProps) {
  return (
    <a href={href} onClick={onClick} target={href && '_blank'} css={buttonCss}>
      {icon && <Icon icon={icon} />}
      {text}
    </a>
  );
}
