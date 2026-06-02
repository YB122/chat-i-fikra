const form = document.querySelector("form")!;
form.addEventListener("submit", async (e: Event) => {
  console.log("form submitted");
  e.preventDefault();
  const username = (document.getElementById("username") as HTMLInputElement).value;
  const room = (document.getElementById("room") as HTMLInputElement).value;

  try {
    const response = await fetch("/go-to-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: username, room }),
    });

    const result = await response.json();
    if (response.ok || response.status === 201) {
      window.location.href = `chat.html?username=${username}&room=${room}`;
    } else {
      (Swal as any).fire({
        icon: "error",
        title: "Oops...",
        text: result.message || "Something went wrong!",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    (Swal as any).fire({
      icon: "error",
      title: "Error",
      text: "Could not connect to the server.",
    });
  }
});
