import {
  createServiceTable,
  createUserTable,
  createVehicleTable,
} from "./tableInit.js";

export default async function dbInit() {
  await createUserTable();
  await createVehicleTable();
  await createServiceTable();
}
