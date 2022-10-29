import {
  getDatabase,
  ref,
  set,
  get,
  child,
  push,
  onChildAdded,
  query,
  equalTo,
  onChildRemoved,
  update
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

async function setGchat() {

  $("#gchat1").click(async (e) => {
    e.preventDefault()

    let user = await window.db.getUser(localStorage.getItem("Chatos"))
    let msg = $("#gchat").val()

    if (msg.split("").length > 0) {
      $("#gchat").val("")

      msg = await window.db.formatMsg(msg)

      return await window.db.setGchat({
        data: user,
        msg: msg,
        img: null,
        time: new Date().getTime()
      })
    }
  })

  $("#GchatU").on("change",
    async e => {
      let user = await window.db.getUser(localStorage.getItem("Chatos"))
      let reader = new FileReader()

      reader.readAsDataURL(e.target.files[0])

      reader.addEventListener("load", async () => {
        return await window.db.setGchat({
          data: user,
          msg: null,
          img: reader.result,
          time: new Date().getTime()
        })
      })
    })

  onChildAdded(ref(window.db.db, "Gchat"),
    async e => {
      let data = e.val()
      let time = new Date(data.time)
      let user = await window.db.getUser(localStorage.getItem("Chatos"))

      if (!data || !data.data) return;

      $(".f-1-can").append(`<div class="Gmsg hover-2" id="${e.key}"><img id="${data.data ? data.data.id: null}" src="${data.data ? data.data.pfp: null}" class="Gmsg3"><p class="Gmsg1"><span class="Gmsg2">${data.data ? data.data.username: null}<span class="Gmsg4"> • ${window.db.formatAMPM(time)} - ${time.getDate()} ${time.monthNames[time.getMonth()]}, ${time.getFullYear()}</span></span><br>${data.msg ? `<span class="Gmsg5">${data.msg}</span>`: `<img class="GmsgI" src="${data.img ? data.img: null}">`}</p></div>`)

      document.getElementById("f-1-can").scrollTo(0, document.getElementById("f-1-can").scrollHeight)

      let i = 0;
      let int;

      $(".Gmsg").dblclick(async function() {
        let id = $(this).attr("id")

        let data = await window.db.getGchat(id)

        $(".GmsgEdit").css({
          height: "100vh"
        })

        $(".GmsgEdit").click(() => $(".GmsgEdit").css({
          height: "0"
        }))

        $(".GmsgDelete").click(async function() {

          if (data.data.id !== window.userId) {
            return window.db.err("You cannot delete other's messages.")
          }

          return await window.db.deleteGchat(id)
        })

        $(".GmsgCopyUserId").click(async() => {
          let userid = $(this).children().attr("id")

          return window.db.copyToClip(userid)
        })

      })
    })

  onChildRemoved(ref(window.db.db, "Gchat"), e => {
    return $("#" + e.key).remove()
  })

  let lastScrollTop = 0;
  $(".f-1-can").scroll(function(evt) {
    let st = $(this).scrollTop();
    let top = st + $(this).innerHeight()

    if (st > lastScrollTop) {
      if (top + 5 >= this.scrollHeight) {
        $(".f-1-can-down").css({
          visibility: "hidden"
        })
      }
    } else {
      $(".f-1-can-down").css({
        visibility: "visible"
      })
    }

    lastScrollTop = st <= 0 ? 0: st;
  })

  $(".f-1-can-down").click(() => {
    document.getElementById("f-1-can").scrollTo(0, document.getElementById("f-1-can").scrollHeight)
  })

}

//export default setGchat