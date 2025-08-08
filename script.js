class StudyTimer {
  constructor() {
    this.el = document.querySelector(".clock")
    this.time = { a: [], b: [] }
    this.rollClass = "clock__block--bounce"
    this.rollTimeout = null

    // Timer state
    this.totalSeconds = 0
    this.remainingSeconds = 0
    this.originalTime = 0
    this.isRunning = false
    this.isPaused = false
    this.interval = null

    this.updateDisplay()
  }

  setTimer(hours, minutes, seconds) {
    if (this.isRunning) {
      this.stop()
    }

    this.totalSeconds = hours * 3600 + minutes * 60 + seconds
    this.remainingSeconds = this.totalSeconds
    this.originalTime = this.totalSeconds

    this.updateDisplay()
    this.updateStatus(
      "Timer set for " +
        this.formatTime(this.totalSeconds) +
        " - Ready to start!"
    )
    this.updateProgress()
  }

  start() {
    if (this.totalSeconds === 0) {
      this.updateStatus("Please set the time first!")
      return
    }

    this.isRunning = true
    this.isPaused = false

    this.interval = setInterval(() => {
      this.remainingSeconds--
      this.updateDisplay()
      this.updateProgress()

      if (this.remainingSeconds <= 0) {
        this.complete()
      }
    }, 1000)

    this.updateStatus("📚 Study Time is Running! Stay Focused!")
    document.querySelector(".status").className = "status status--running"
  }

  pause() {
    if (!this.isRunning) return

    this.isRunning = false
    this.isPaused = true
    clearInterval(this.interval)

    this.updateStatus("⏸️ Timer Paused - Press Start to Continue")
    document.querySelector(".status").className = "status status--paused"
  }

  reset() {
    this.isRunning = false
    this.isPaused = false
    clearInterval(this.interval)

    this.remainingSeconds = this.totalSeconds
    this.updateDisplay()
    this.updateProgress()

    if (this.totalSeconds > 0) {
      this.updateStatus("Timer reset - Ready to start!")
    } else {
      this.updateStatus("Timer Ready - Set your study time!")
    }
    document.querySelector(".status").className = "status"
  }

  stop() {
    this.isRunning = false
    this.isPaused = false
    clearInterval(this.interval)
  }

  complete() {
    this.stop()
    this.updateStatus("🎉 Congratulations! Study Session Complete! 🎉")
    document.querySelector(".status").className = "status status--finished"

    // Play completion sound (if browser allows)
    this.playNotificationSound()

    // Show browser notification
    this.showNotification()
  }

  updateDisplay() {
    const hours = Math.floor(this.remainingSeconds / 3600)
    const minutes = Math.floor((this.remainingSeconds % 3600) / 60)
    const seconds = this.remainingSeconds % 60

    const newTime = [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ]

    this.time.a = [...this.time.b]
    this.time.b = newTime

    if (!this.time.a.length) {
      this.time.a = [...this.time.b]
    }

    this.displayTime()
    this.animateDigits()
  }

  displayTime() {
    // Screen reader time
    this.el.ariaLabel = this.time.b.join(":")

    // Displayed time
    Object.keys(this.time).forEach((letter) => {
      const letterEls = this.el.querySelectorAll(`[data-time="${letter}"]`)
      Array.from(letterEls).forEach((el, i) => {
        el.textContent = this.time[letter][i]
      })
    })
  }

  animateDigits() {
    const groups = this.el.querySelectorAll("[data-time-group]")
    Array.from(groups).forEach((group, i) => {
      const { a, b } = this.time
      if (a[i] !== b[i]) {
        group.classList.add(this.rollClass)
      }
    })

    clearTimeout(this.rollTimeout)
    this.rollTimeout = setTimeout(() => {
      const groups = this.el.querySelectorAll("[data-time-group]")
      Array.from(groups).forEach((group) => {
        group.classList.remove(this.rollClass)
      })
    }, 900)
  }

  updateStatus(message) {
    document.getElementById("status").textContent = message
  }

  updateProgress() {
    if (this.originalTime === 0) return

    const progress =
      ((this.originalTime - this.remainingSeconds) / this.originalTime) * 100
    document.getElementById("progressFill").style.width = progress + "%"
  }

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  playNotificationSound() {
    // Create a simple beep sound
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 1
      )

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    } catch (e) {
      console.log("Audio notification not supported")
    }
  }

  showNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Study Timer Complete!", {
        body: "Congratulations! Your study session is complete!",
        icon: "📚",
      })
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Study Timer Complete!", {
            body: "Congratulations! Your study session is complete!",
            icon: "📚",
          })
        }
      })
    }
  }
}

// Initialize timer
const timer = new StudyTimer()

// Button functions
function startTimer() {
  if (timer.isPaused) {
    timer.start()
  } else {
    const hours = parseInt(document.getElementById("hours").value) || 0
    const minutes = parseInt(document.getElementById("minutes").value) || 0
    const seconds = parseInt(document.getElementById("seconds").value) || 0

    timer.setTimer(hours, minutes, seconds)
    timer.start()
  }
}

function pauseTimer() {
  timer.pause()
}

function resetTimer() {
  timer.reset()
}

function setPreset(hours, minutes, seconds) {
  document.getElementById("hours").value = hours
  document.getElementById("minutes").value = minutes
  document.getElementById("seconds").value = seconds

  timer.setTimer(hours, minutes, seconds)
}

// Request notification permission on page load
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission()
}
