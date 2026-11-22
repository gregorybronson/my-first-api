export default async () => {
  return Response.json({
    message: "Hello from Greg's first API",
    time: new Date().toISOString()
  });
};
