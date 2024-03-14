export default async function healthCheck(req, res) {
  const object = {
    health: "ok",
  };
  res.status(200).json(object);
}
