// Fake backend boundary for easy backend swap later.
// Endpoints mirrored:
// - GET /transactions
// - POST /scan
// - GET /opportunities
// - POST /opportunity/{id}/submit
export * from "@/lib/services/apiClient";
