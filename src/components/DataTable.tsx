import type { ReactNode } from "react";
export function DataTable({
  headers,
  children,
  empty = false,
}: {
  headers: ReactNode[];
  children?: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td colSpan={headers.length} className="empty">
                No records available
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
