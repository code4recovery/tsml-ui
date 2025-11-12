import { buttonCss, buttonDirectionsCss, buttonJoinCss } from '../styles';

import Icon, { icons } from './Icon';

export default function Button({
  href,
  icon,
  onClick,
  text,
  type,
}: {
  href?: string;
  icon?: keyof typeof icons;
  onClick?: () => void;
  text?: string;
  type?: 'in-person' | 'online';
}) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      css={
        type === 'in-person'
          ? buttonDirectionsCss
          : type === 'online'
            ? buttonJoinCss
            : buttonCss
      }
      href={href}
      onClick={onClick}
      target={href && '_blank'}
    >
      {icon && <Icon icon={icon} />}
      {text}
    </Tag>
  );
}
