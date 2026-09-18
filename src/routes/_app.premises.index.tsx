import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Plus, Search } from "lucide-react"
import type { Premises } from "@/domain/types"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const Route = createFileRoute("/_app/premises/")({ component: PremisesDirectory })

const columns: ColumnDef<Premises>[] = [
  { accessorKey: "businessName", header: "Premises", cell: ({ row }) => <div><Link to="/premises/$premisesId" params={{ premisesId: row.original.id }} className="font-medium hover:underline">{row.original.businessName}</Link><p className="text-xs text-muted-foreground">{row.original.id} · {row.original.address}</p></div> },
  { accessorKey: "premisesType", header: "Type" }, { accessorKey: "ward", header: "Ward" },
  { accessorKey: "complianceStatus", header: "Compliance", cell: ({ row }) => <StatusBadge status={row.original.complianceStatus}/> },
  { accessorKey: "outstandingContraventions", header: "Open findings", cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span> },
]

function PremisesDirectory() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const data = useMemo(() => seedDatabase.premises.filter(p => (!query || `${p.businessName} ${p.tradingName} ${p.address} ${p.id}`.toLowerCase().includes(query.toLowerCase())) && (!status || p.complianceStatus === status)), [query, status])
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  return <div className="flex flex-col gap-6"><PageHeader eyebrow="Environmental health register" title="Premises" description="Find premises, review compliance standing, and open the complete regulatory record." actions={<Button><Plus/>Register premises</Button>}/>
    <Card className="p-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input value={query} onChange={e => setQuery(e.target.value)} className="pl-9" placeholder="Search name, reference or address"/></div><select aria-label="Compliance status" className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={e => setStatus(e.target.value)}><option value="">All compliance states</option>{["Compliant", "At Risk", "Non-compliant", "Not Found"].map(s => <option key={s}>{s}</option>)}</select></div></Card>
    {data.length ? <Card className="overflow-hidden py-0"><Table><TableHeader><TableRow>{table.getHeaderGroups()[0].headers.map(header => <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow></TableHeader><TableBody>{table.getRowModel().rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table><div className="border-t px-4 py-3 text-xs text-muted-foreground">Showing {data.length} of {seedDatabase.premises.length} registered premises</div></Card> : <EmptyState/>}
  </div>
}
