import type { MockDatabase, Premises } from "@/domain/types"

const premises = [
  ["PR-001", "Riverside Kitchen & Foods", "Riverside Kitchen", "12 Abonnema Wharf Road", "Diobu", "phc", "Restaurant", "Compliant", 0],
  ["PR-002", "Trans-Amadi Food Court", "TA Food Court", "45 Trans-Amadi Road", "Oginigba", "phc", "Food Court", "At Risk", 2],
  ["PR-003", "Garden City Cold Stores", "Garden City Cold Stores", "8 Olu Obasanjo Road", "D-Line", "phc", "Cold Store", "Non-compliant", 4],
  ["PR-004", "Creek View Bakery", "Creek View", "21 Aggrey Road", "Town", "phc", "Bakery", "Not Found", 0],
  ["PR-005", "Rumuokoro Fresh Mart", "Fresh Mart", "3 East-West Road", "Rumuokoro", "obio", "Supermarket", "Compliant", 0],
  ["PR-006", "Eliozu Event Centre", "The Atrium", "17 Eliozu Road", "Eliozu", "obio", "Event Centre", "At Risk", 1],
  ["PR-007", "Choba Campus Canteen", "Campus Canteen", "University Road", "Choba", "obio", "Restaurant", "Non-compliant", 3],
  ["PR-008", "Woji Community Pharmacy", "Woji Pharmacy", "33 Woji Road", "Woji", "obio", "Pharmacy", "Compliant", 0],
  ["PR-009", "Bonny Island Guest House", "Island Guest House", "King Perekule Road", "Finima", "bonny", "Hotel", "Compliant", 0],
  ["PR-010", "Finima Seafood Depot", "Finima Seafood", "7 Market Lane", "Finima", "bonny", "Food Depot", "At Risk", 2],
  ["PR-011", "Bonny Central Bakery", "Central Bakery", "14 Hospital Road", "Bonny Town", "bonny", "Bakery", "Non-compliant", 5],
  ["PR-012", "Ibani Waterfront Grill", "Waterfront Grill", "2 Marina Close", "Bonny Town", "bonny", "Restaurant", "Not Found", 0],
] satisfies Array<[string, string, string, string, string, string, string, Premises["complianceStatus"], number]>

export const seedDatabase: MockDatabase = {
  schemaVersion: 1,
  councils: [
    { id: "phc", name: "Port Harcourt City", code: "PHALGA" },
    { id: "obio", name: "Obio/Akpor", code: "OBALGA" },
    { id: "bonny", name: "Bonny", code: "BLGA" },
  ],
  premises: premises.map(([id, businessName, tradingName, address, ward, councilId, premisesType, complianceStatus, outstandingContraventions], index) => ({
    id, businessName, tradingName, address, ward, councilId, premisesType, complianceStatus, outstandingContraventions,
    certificates: [
      { id: `HC-${1001 + index}`, type: "Health Approval", status: complianceStatus === "Compliant" ? "Active" : complianceStatus === "Not Found" ? "Not Found" : "At Risk", expiresAt: "2026-12-31" },
      { id: `FC-${1001 + index}`, type: "Fumigation", status: index % 3 === 0 ? "Expiring Soon" : "Active", expiresAt: "2026-10-30" },
    ],
    documents: [{ id: `DOC-${index + 1}`, name: "Premises registration", category: "Registration", addedAt: "2026-07-12" }],
    inspections: [{ id: `INS-${index + 1}`, type: "Routine inspection", status: index % 2 ? "Scheduled" : "Completed", scheduledAt: "2026-09-22", officer: index % 2 ? "Ebi Briggs" : "Tamuno George" }],
  })),
  workItems: [
    ["W-01", "application", "Review food premises application", "Riverside Kitchen submitted supporting documents", "Awaiting review", "phc", "high", "/applications", ["admin", "moh-director"]],
    ["W-02", "inspection", "Conduct priority inspection", "Trans-Amadi Food Court has two open contraventions", "Due today", "phc", "high", "/inspections", ["eho", "admin"]],
    ["W-03", "certificate", "Approve health certificate", "Garden City Cold Stores completed remediation", "Decision required", "phc", "medium", "/certificates", ["moh-director"]],
    ["W-04", "payment", "Reconcile registration payment", "Payment reference requires verification", "Unmatched", "phc", "medium", "/finance", ["finance-officer", "super-admin"]],
    ["W-05", "premises", "Verify premises location", "Creek View Bakery could not be found", "Field follow-up", "phc", "high", "/premises/PR-004", ["eho", "admin"]],
    ["W-06", "inspection", "Complete inspection report", "Eliozu Event Centre inspection is awaiting notes", "In progress", "obio", "normal", "/inspections", ["eho"]],
    ["W-07", "application", "Validate ownership documents", "Rumuokoro Fresh Mart uploaded a new CAC record", "Awaiting review", "obio", "normal", "/applications", ["admin"]],
    ["W-08", "certificate", "Review certificate suspension", "Choba Campus Canteen has unresolved findings", "Decision required", "obio", "high", "/certificates", ["moh-director"]],
    ["W-09", "payment", "Confirm inspection levy", "Bonny Island Guest House payment is pending", "Pending", "bonny", "normal", "/finance", ["finance-officer"]],
    ["W-10", "premises", "Revisit unverified address", "Ibani Waterfront Grill location needs confirmation", "Field follow-up", "bonny", "medium", "/premises/PR-012", ["eho", "admin"]],
  ].map(([id, kind, title, description, status, councilId, priority, href, permittedRoles], index) => ({ id, kind, title, description, status, councilId, priority, href, permittedRoles, updatedAt: `2026-09-${String(18 - index).padStart(2, "0")}T09:00:00Z` })) as MockDatabase["workItems"],
  activity: Array.from({ length: 8 }, (_, index) => ({
    id: `A-${index + 1}`,
    title: ["Inspection completed", "Application submitted", "Certificate issued", "Payment confirmed"][index % 4],
    description: ["Routine inspection record updated", "New supporting documents received", "Health approval is now active", "Receipt matched to application"][index % 4],
    occurredAt: `2026-09-${String(18 - index).padStart(2, "0")}T${String(8 + index).padStart(2, "0")}:15:00Z`,
    actor: ["Ebi Briggs", "Riverside Kitchen", "Dr. Mina Abbey", "Finance Desk"][index % 4],
    councilId: ["phc", "obio", "bonny"][index % 3],
  })),
}
