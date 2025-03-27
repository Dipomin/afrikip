import { parseISO, format } from "date-fns";
import fr from "date-fns/locale/fr";

export default function Date({ dateString }) {
  const locale = fr;
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString}>
      {format(date, "d MMMM, yyyy h:mm a", { locale })}
    </time>
  );
}
