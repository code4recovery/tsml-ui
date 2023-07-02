import { formatClasses as cx } from '../helpers';
import Icon, { icons } from './Icon';

type ButtonProps = {
  className?: string;
  href?: string;
  icon?: keyof typeof icons;
  onClick?: () => void;
  small?: boolean;
  text?: string;
};

export default function Button({
  className,
  href,
  icon,
  onClick,
  small = false,
  text,
}: ButtonProps) {
  return (
    <a
      className={cx(
        'align-items-center btn justify-content-center',
        {
          'd-flex overflow-hidden': !small,
          'btn-sm d-inline-flex': small,
          'cursor-pointer': !!(href || onClick),
          'btn-outline-secondary': !small && !className,
        },
        className
      )}
      href={href}
      onClick={onClick}
      target={href && '_blank'}
    >
      {icon && (
        <Icon
          icon={icon}
          size={small ? 18 : undefined}
          className={small ? 'me-1' : 'me-2'}
        />
      )}
      {small ? text : <div className="text-truncate">{text}</div>}
    </a>
  );
}
