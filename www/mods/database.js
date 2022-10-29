import {
  initializeApp
} from "./firebase-app.js";
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
  update,
  onValue
} from "./firebase-database.js";

import {
  setPChatter
} from "./Pchat.js"

class Database {
  constructor() {
    window.db = this
    this.i = 0
    this.msgs = []
  }

  async setUpPchat() {
    await setPChatter()
  }

  async getUser(id) {
    return get(child(this.ref, "users/" + id)).then(c => c.val())
  }

  async findUser(name) {
    let list = await this.getUsers()

    let user = Object.keys(list).filter(c => list[c].username === name)

    return list[user]
  }

  async updateUser(id, data) {
    let up = {}

    up["/users/" + id] = data

    return update(this.ref, up)
  }

  async createUser(id, data) {
    return set(ref(this.db, "users/" + id), data)
  }

  async getUsers() {
    return get(child(this.ref, "users")).then(c => c.val())
  }

  async getPchats() {
    let data = await get(child(this.ref, "Pchat"))

    return data.val()
  }

  async getPchat(id) {
    let data

    data = await get(child(this.ref, `Pchat/${id}-${window.userId}`)).then(e => e.val())

    if (!data) {
      data = await get(child(this.ref, `Pchat/${window.userId}-${id}`)).then(c => c.val())
    }

    return data
  }

  async getLinePchat(id) {
    let data,
    line

    data = await get(child(this.ref, `Pchat/${id}-${window.userId}`)).then(e => e.val())
    line = `${id}-${window.userId}`

    if (!data) {
      data = await get(child(this.ref, `Pchat/${window.userId}-${id}`)).then(c => c.val())
      line = `${window.userId}-${id}`
    }

    if (!data) {
      line = null
    }

    return line;
  }

  async getUserPchat(e) {
    e = e.split("-")
    let el;

    if (e[0] === window.userId || e[1] === window.userId) {

      e = e.filter(c => c !== window.userId)
      el = e[0]
    } else {
      el = false
    }

    return el;
  }

  setPchat(line, data) {
    return set(push(ref(this.db, `Pchat/${line}/chat`)), data)
  }

  createPchat(id) {
    return set(ref(this.db, `Pchat/${window.userId}-${id}`), {
      date: Date.now()
    })
  }

  async getGchats() {
    return get(child(this.ref, "Gchat")).then(c => c.val())
  }

  async getGchat(id) {
    return get(child(this.ref, "Gchat/" + id)).then(e => e.val())
  }

  async getPchat(pline, id) {
    return get(child(this.ref, `Pchat/${pline}/chat/${id}`)).then(e => e.val())
  }

  async setGchat(data) {
    return set(push(ref(this.db, "Gchat")), data)
  }

  async deletePchat(pline, id) {
    return set(ref(this.db, `Pchat/${pline}/chat/${id}`), null)
  }
  async deleteGchat(id) {
    return set(ref(this.db, "Gchat/" + id), null)
  }

  copyToClip(text) {
    navigator.clipboard.writeText(text)
    .then(e => {
      this.err("Copied to clipboard.")
    })
    .catch(e => {
      this.err(e.message)
    })
  }

  err(text) {
    $("body").append(`
      <div class="error">
      <span>${text}</span>
      </div>
      `)

    setTimeout(() => {
      $(".error").remove()
    }, 2000)
  }

  formatMsg(str) {
    const toHTML = str
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>');

    return toHTML.trim()
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm': 'am';
    hours = hours % 12;
    hours = hours ? hours: 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes: minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  initDb() {
    this.db = getDatabase(initializeApp(this.key()))

    const connectedRef = ref(this.db, ".info/connected");
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        //connected
      } else {
        window.db.err("If Not Loaded, check your connection!")
      }
    });

    return this.ref = ref(this.db)
  }

  key() {
    const firebaseConfig = {
      apiKey: "AIzaSyAcQDw3_i3w-9OsEg-vOBnwZ_dt_1JuQNI",
      authDomain: "chat-1c3b4.firebaseapp.com",
      projectId: "chat-1c3b4",
      storageBucket: "chat-1c3b4.appspot.com",
      messagingSenderId: "505765116475",
      appId: "1:505765116475:web:1aa0ce90e43467aefafa1e",
      databaseURL: "https://chat-1c3b4-default-rtdb.firebaseio.com/"
    };

    return firebaseConfig;
  }

  login() {
    $("body").append(`<div class="login1">
      <div class="login2">
      <p class="loginN">Chatos</p>
      <div class="loginor"></div>
      <form class="loginF">
      <input name="username" class="loginU" type="text" placeholder="Username.." required><br>
      <input name="pass" class="loginP" type="password" placeholder="Password.." required><br><br>
      <label class="showpass" id="showp">Show Password</label><br>
      <button type="submit" class="loginS">Submit</button>
      </form>
      </div>
      </div>`)

    $(".showpass").click(() => {
      if ($(".loginP").attr("type") === "password") {
        $(".loginP").attr("type", "text")
      } else {
        $(".loginP").attr("type", "password")
      }
    })

    $(".loginF").submit(async (e) => {

      e.preventDefault();

      const data = {
        name: $(".loginU").val(),
        pass: $(".loginP").val()
      }

      let puser = await window.db.findUser(data.name)

      if (!puser) {
        let id = window.db.createId()

        await window.db.createUser(id, {
          id: id,
          username: data.name,
          password: data.pass,
          pfp: `https://avatars.dicebear.com/api/adventurer/${(Math.random() + 1).toString(36).substring(7)}.svg`,
        })

        localStorage.setItem("Chatos", id)

        return window.location.reload()

      } else if (puser && puser.password === data.pass) {
        localStorage.setItem("Chatos", puser.id)

        return window.location.reload()

      } else {
        return window.db.err("Wrong Password!")
      }
    })
  }

  createId() {
    return Math.random().toString(36).slice(2,
      12)
  }
}

export default Database