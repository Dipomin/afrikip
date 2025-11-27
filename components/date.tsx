import { parseISO, format, isValid } from "date-fns";
import fr from "date-fns/locale/fr";

interface DateProps {
  dateString: string;
  showTime?: boolean;
  formatString?: string;
  className?: string;
}

export default function Date({
  dateString,
  showTime = false,
  formatString,
  className = "text-gray-700",
}: DateProps) {
  const locale = fr;

  // Fonction pour parser différents formats de date de manière robuste
  const parseDate = (dateStr: string): globalThis.Date | null => {
    if (!dateStr || typeof dateStr !== "string") return null;

    try {
      // Nettoyer la chaîne de date
      const cleanedDateStr = dateStr.trim();

      // Essayer parseISO d'abord (format ISO standard)
      let parsedDate = parseISO(cleanedDateStr);
      if (isValid(parsedDate)) return parsedDate;

      // Essayer avec le constructeur Date natif
      parsedDate = new globalThis.Date(cleanedDateStr);
      if (isValid(parsedDate) && !isNaN(parsedDate.getTime()))
        return parsedDate;

      // Essayer de parser des formats spécifiques
      const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (isoPattern.test(cleanedDateStr)) {
        parsedDate = parseISO(cleanedDateStr.split(".")[0] + "Z");
        if (isValid(parsedDate)) return parsedDate;
      }

      // Essayer de parser une date simple YYYY-MM-DD
      const datePattern = /^\d{4}-\d{2}-\d{2}/;
      if (datePattern.test(cleanedDateStr)) {
        parsedDate = parseISO(cleanedDateStr.split(" ")[0]);
        if (isValid(parsedDate)) return parsedDate;
      }

      return null;
    } catch (error) {
      console.warn("Erreur lors du parsing de la date:", dateStr, error);
      return null;
    }
  };

  const date = parseDate(dateString);

  // Si la date n'est pas valide, afficher un fallback discret
  if (!date) {
    return (
      <time dateTime={dateString} className="text-gray-400 text-sm">
        --
      </time>
    );
  }

  // Déterminer le format à utiliser
  let displayFormat = formatString;
  if (!displayFormat) {
    displayFormat = showTime ? "d MMMM yyyy 'à' HH:mm" : "d MMMM yyyy";
  }

  try {
    const formattedDate = format(date, displayFormat, { locale });

    return (
      <time
        dateTime={date.toISOString()}
        className={className}
        title={date.toISOString()}
      >
        {formattedDate}
      </time>
    );
  } catch (error) {
    console.warn("Erreur lors du formatage de la date:", date, error);

    // Fallback avec formatage natif JavaScript
    try {
      const fallbackDate = showTime
        ? date.toLocaleString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : date.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      return (
        <time
          dateTime={date.toISOString()}
          className={className}
          title={date.toISOString()}
        >
          {fallbackDate}
        </time>
      );
    } catch (fallbackError) {
      console.warn("Erreur lors du formatage de fallback:", fallbackError);

      // Dernier recours
      return (
        <time dateTime={date.toISOString()} className="text-white text-sm">
          {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
        </time>
      );
    }
  }
}
