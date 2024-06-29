export async function loader() {
  console.log({
    success: false,
    data: {},
    error: {msg: "no id requested"},
  });
  return null;
}
