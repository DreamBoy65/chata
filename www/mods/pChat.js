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
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
let Pline;
let first = true;

async function setPChatter() {
  onChildAdded(ref(window.db.db, "Pchat"), async (el) => {
    //  console.log(e.val(), e.key)

    let e = await window.db.getUserPchat(el.key)

    if (!e) return;

    let data = await window.db.getUser(`${e}`)


    $(".f-2-can").append(`<div class="f-2-user hover-2" id="${e}">
      <img src="${data.pfp}" class="f-2-pfp">
      <div class="f-2-username">
      ${data.username}
      </div>
      <div class="f-2-chatf">
      lol
      </div>
      </div>`
    )


    document.getElementById(e).onclick = async function() {
      //console.log($(this).attr("id"))

      $("#f-4-can").empty()
      $("#f-4-can").append(`<div class="f-4-can-down" id="f-4-can-down"></div>`)

      let userId = $(this).attr("id")

      window.location.href = "#f-4-can"

      await window.db.sleep(1000)

      Pline = await window.db.getLinePchat(userId)

      onChildAdded(ref(window.db.db, `Pchat/${Pline}/chat`), async(e) => {
        let data = e.val()

        if (!document.getElementById(e.key)) {
          let time = new Date(data.time)
          let user = await window.db.getUser(localStorage.getItem("Chatos"))

          if (document.getElementById(e.key)) return;


          /* $("#f-4-can").append(`<span class="white" id="${e.key}">${data.msg}</span><br>`)*/

          await $("#f-4-can").append(`<div class="Pmsg hover-2" id="${e.key}"><img id="${data.data ? data.data.id: null}" src="${data.data ? data.data.pfp: null}" class="Pmsg3"><p class="Pmsg1"><span class="Pmsg2">${data.data ? data.data.username: null}<span class="Pmsg4"> • ${window.db.formatAMPM(time)} - ${time.getDate()} ${time.monthNames[time.getMonth()]}, ${time.getFullYear()}</span></span><br>${data.msg ? `<span class="Pmsg5">${data.msg}</span>`: `<img class="PmsgI" src="${data.img ? data.img: null}">`}</p></div>`)


          document.getElementById("f-4-can").scrollTo(0, document.getElementById("f-4-can").scrollHeight)
          $(".Pmsg").dblclick(async function() {
            let id = $(this).attr("id")

            let data = await window.db.getPchat(Pline, id)

            $(".PmsgEdit").css({
              height: "100vh"
            })

            $(".PmsgEdit").click(() => $(".PmsgEdit").css({
              height: "0"
            }))

            $(".PmsgDelete").click(async function() {
              if (data.data.id === window.userId) {

                return await window.db.deletePchat(Pline, id)
              } else {

                window.db.err("You cannot delete other's messages.")

                return;
              }
            })

            $(".PmsgCopyUserId").click(async() => {
              let userid = $(this).children().attr("id")

              return window.db.copyToClip(userid)
            })

          })



          /* let time = new Date(data.time)
                                        let user = await window.db.getUser(localStorage.getItem("Chatos"))
                                        if(data || data.data) {
                                           $("#f-4-can").append(`<div class="Pmsg hover-2" id="${e.key}"><img src="${data.data ? data.data.pfp: null}" class="Pmsg3"><p class="Pmsg1"><span class="Pmsg2">${data.data ? data.data.username: null}<span class="Pmsg4"> • ${window.db.formatAMPM(time)} - ${time.getDate()} ${time.monthNames[time.getMonth()]}, ${time.getFullYear()}</span></span><br>${data.msg ? `<span class="Pmsg5">${data.msg}</span>`: `<img class="PmsgI" src="${data.img ? data.img: null}">`}</p></div>`)
                                           document.getElementById("f-4-can").scrollTo(0, document.getElementById("f-4-can").scrollHeight)
                                       /*    $(".Pmsg").dblclick(async function() {
                                                   let id = $(this).attr("id")
                                                   let data = await window.db.getPchat(Pline, id)
                                                   $(".PmsgEdit").css({ height: "100vh" })
                                                   $(".PmsgEdit").click(() => $(".PmsgEdit").css({ height: "0" }))
                                                   $(".PmsgDelete").click(async function() {
                                                           if (data.data.id === window.userId) {
                                                                   return await window.db.deletePchat(Pline, id)
                                                           } else {
                                                                   window.db.err("You cannot delete other's messages.")
                                                                   return;
                                                           }
                                                   })
                                                   $(".PmsgCopyUserId").click(async () => {
                                                           let userid = $(this).children().attr("id")
                                                           return window.db.copyToClip(userid)
                                                   })
                                           })
                                      } */

        }
      })


      onChildRemoved(ref(window.db.db, `Pchat/${Pline}/chat`), e => {
        return $("#" + e.key).remove()
      })

      document.getElementById("pchat1").onclick = async function(e) {
        e.preventDefault()

        let user = await window.db.getUser(localStorage.getItem("Chatos"))
        let msg = $("#pchat").val()

        if (msg.split("").length > 0) {
          $("#pchat").val("")
          msg = await window.db.formatMsg(msg)

          return await window.db.setPchat(Pline, {
            data: user,
            msg: msg,
            img: null,
            time: new Date().getTime()
          })
        }
      }

      document.querySelector("#PchatU").onchange = async function(e) {
        let user = await window.db.getUser(localStorage.getItem("Chatos"))
        let reader = new FileReader()

        reader.readAsDataURL(e.target.files[0])

        reader.addEventListener("load", async () => {
          return await window.db.setPchat(Pline, {
            data: user,
            msg: null,
            img: reader.result,
            time: new Date().getTime()
          })
        })
      }

      let lastScrollTop = 0;
      document.querySelector(".f-4-can").onscroll = function(evt) {
        let st = $(this).scrollTop();
        let top = st + $(this).innerHeight()

        if (st > lastScrollTop) {
          if (top + 5 >= this.scrollHeight) {
            $(".f-4-can-down").css({
              visibility: "hidden"
            })
          }
        } else {
          $(".f-4-can-down").css({
            visibility: "visible"
          })
        }

        lastScrollTop = st <= 0 ? 0: st;
      }

      $("#f-4-can-down").click(() => {
        document.getElementById("f-4-can").scrollTo(0, document.getElementById("f-4-can").scrollHeight)
      })
    }
  })

  $(".f-2-add").click(async function() {
    $(".body").append(`
      <div class="f-2-add1">
      <div class="f-2-add2">

      <div class="f-2-add6">
      Enter User Id:
      </div>

      <input class="f-2-add4" type="text" placeholder="Enter user id.">

      <div class="f-2-add3">

      </div>

      <div class="f-2-add5">
      Send Request
      </div>
      </div>
      </div>`)


    $(".f-2-add3").click(() => {
      $(".f-2-add1").remove()
    })

    $(".f-2-add5").click(async () => {
      let input = $(".f-2-add4").val()

      if (!input) return;

      let user = await window.db.getUser(input)

      if (!user) {
        $(".f-2-add6").text("No user found!")

        return;
      }

      $(".f-2-add6").text(`User found: ${user.username}, adding....`)

      setTimeout(async () => {
        let use = await window.db.getLinePchat(input)
        console.log(use)

        if (use) {
          window.db.err("User is already in you chatbox!")

          return;
        }

        await window.db.createPchat(input)

        $(".f-2-add1").remove()

        window.db.err("Added user: " + user.username)
        return;
      },
        2000)
    })
  })
}
export {
  setPChatter
}