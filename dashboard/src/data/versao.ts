/**
 * Versão atual do dashboard.
 *
 * Atualize manualmente a cada release tagged. Exibida no header de todas as páginas.
 *
 * Convenção:
 *   - patch (x.y.Z): ajuste de texto, fix pequeno, mudança visual menor
 *   - minor (x.Y.0): página nova, feature nova, dado novo grande
 *   - major (X.0.0): mudança fundamental (ex.: live mode com backend)
 */
export const VERSAO = "v0.5.0";
export const VERSAO_DATA = "2026-04-30";
export const VERSAO_LABEL = `${VERSAO} · ${formatarData(VERSAO_DATA)}`;

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${dia} ${meses[mes - 1]} ${ano}`;
}
