import { useTheme } from "@/lib/theme";

/**
 * Fixed, behind-content animated background. The actual visuals are driven by
 * CSS keyed on [data-theme]; we just render the layers each theme uses.
 */
export function ThemeBackground() {
  const { theme } = useTheme();
  return (
    <div className="fx-bg" aria-hidden="true">
      {theme === "neon" && (
        <>
          <div className="fx-bg__layer fx-bg__glow" />
          <div className="fx-bg__layer fx-bg__grid" />
          <div className="fx-bg__layer fx-bg__scan" />
        </>
      )}
      {theme === "aurora" && <div className="fx-bg__layer fx-bg__aurora" />}
      {theme === "holo" && (
        <>
          <div className="fx-bg__layer fx-bg__mesh" />
          <div className="fx-bg__layer fx-bg__glow" />
        </>
      )}
      {theme === "mono" && (
        <>
          <div className="fx-bg__layer fx-bg__grid" />
          <div className="fx-bg__layer fx-bg__glow" />
        </>
      )}
    </div>
  );
}
