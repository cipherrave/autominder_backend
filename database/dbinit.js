import {
  createVehiclesTable,
  createServiceRecordsTable,
  createUsersTable,
} from "./tableInit.js";

export default async function dbInit() {
  await createUsersTable();
  await createVehiclesTable();
  await createServiceRecordsTable();
}
