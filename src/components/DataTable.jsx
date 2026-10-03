import { Button, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
export function DataTable({ label, rows, columns, onEdit, onDelete, empty, }) {
    if (rows.length === 0) {
        return (<div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">Nothing on this list</p>
        <p className="mt-2 text-sm text-stone-500">{empty}</p>
      </div>);
    }
    return (<div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgb(28_25_20_/_0.04)]">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label={label}>
            <Table.Header>
              {columns.map((column) => (<Table.Column key={column.header} isRowHeader={column.rowHeader}>
                  {column.header}
                </Table.Column>))}
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (<Table.Row key={row.id} id={row.id}>
                  {columns.map((column) => (<Table.Cell key={column.header}>{column.cell(row)}</Table.Cell>))}
                  <Table.Cell>
                    <div className="flex gap-1">
                      <Button isIconOnly aria-label={`Edit ${label} row`} variant="ghost" size="sm" onPress={() => onEdit(row)}>
                        <Pencil size={15}/>
                      </Button>
                      <Button isIconOnly aria-label={`Remove ${label} row`} variant="ghost" size="sm" onPress={() => onDelete(row)}>
                        <Trash2 size={15}/>
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>);
}
