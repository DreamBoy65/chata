import Database from "./mods/database.js"
import setGchat from "./mods/globalChat.js"
import setPChatter from "./mods/Pchat.js"
new Database()

document.addEventListener("DOMContentLoaded", async function() {
  console.log("Started!")

  if (!localStorage.getItem("Chatos")) {
    window.db.login()
  }

  const triggers = document.querySelectorAll(".f-icon")
  triggers.forEach(e => e.addEventListener("click", function() {
    triggers.forEach(e => this != e ? e.classList.remove("active"): null)

    if (this.classList != "active") {
      this.classList.toggle("active")
    }

    $(".footer").toggleClass("footer-1")
  }))


  /* $("body").css({
    height: window.innerHeight,
    width: window.innerWidth
  })*/

  $("#lol").click(function() {
    launchFullScreen(document.body)
  })

  $("#h-footbar").click(function() {
    $(".footer").toggleClass("footer-1")
  })

  setTimeout(() => {
    //  $("#lol").click()
  },
    2000)

  window.db.initDb()

  let user = await window.db.getUser(localStorage.getItem("Chatos"))

  if (user) {
    $(".h-avatar").css({
      "background-image": `url(${user.pfp})`
    })
  } else {
    window.db.login()
  }

  window.userId = localStorage.getItem("Chatos")

  //await window.db.setUpPchat()
  await setPChatter()
  await setGchat()
})

function launchFullScreen(element) {
  if (element.requestFullScreen) {
    element.requestFullScreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

Date.prototype.monthNames = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
];