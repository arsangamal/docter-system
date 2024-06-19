import 'jsvectormap/dist/css/jsvectormap.css'
import 'flatpickr/dist/flatpickr.min.css'
import '../css/satoshi.css'
import '../css/style.css'

import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'
import flatpickr from 'flatpickr'
import chart01 from './components/chart-01'
import chart02 from './components/chart-02'
import chart03 from './components/chart-03'
import chart04 from './components/chart-04'
import map01 from './components/map-01'
import * as firebase from 'firebase/app'
import * as firestore from 'firebase/firestore'

Alpine.plugin(persist)
window.Alpine = Alpine
Alpine.start()

// Init flatpickr
flatpickr('.datepicker', {
  mode: 'range',
  static: true,
  monthSelectorType: 'static',
  dateFormat: 'M j, Y',
  defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()],
  prevArrow:
    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
  nextArrow:
    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
  onReady: (selectedDates, dateStr, instance) => {
    // eslint-disable-next-line no-param-reassign
    instance.element.value = dateStr.replace('to', '-')
    const customClass = instance.element.getAttribute('data-class')
    instance.calendarContainer.classList.add(customClass)
  },
  onChange: (selectedDates, dateStr, instance) => {
    // eslint-disable-next-line no-param-reassign
    instance.element.value = dateStr.replace('to', '-')
  },
})

flatpickr('.form-datepicker', {
  mode: 'single',
  static: true,
  monthSelectorType: 'static',
  dateFormat: 'M j, Y',
  prevArrow:
    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
  nextArrow:
    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
})

// Document Loaded
document.addEventListener('DOMContentLoaded', () => {
  chart01()
  chart02()
  chart03()
  chart04()
  map01()
})

// Replace these with your actual Firebase configuration values
const firebaseConfig = {
  apiKey: 'AIzaSyCKnX5XOLKjioMeSf__YW0RQiojg1ax6yA',
  authDomain: 'doctor-system-philip.firebaseapp.com',
  projectId: 'doctor-system-philip',
  storageBucket: 'doctor-system-philip.appspot.com',
  messagingSenderId: '408809322068',
  appId: '1:408809322068:web:ea18aba374e9c0d8fedfc1',
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig)

  const db = firestore.getFirestore(app)

  firestore.getDocs(firestore.collection(db, 'users')).then((querySnapshot) => {
    let output = ''
    if (document.getElementById('usertemplate') !== null) {
      const templateHTML = document.getElementById('usertemplate').innerHTML
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        output += templateHTML.replace('{{id}}', doc.id).
          replace('{{name}}', data.username).
          replace('{{role}}', data.role)
      })

      document.getElementById('newoutput').innerHTML = output
    }
  })

  firestore.getDocs(firestore.collection(db, 'patients')).
    then((querySnapshot) => {
      let output = ''
      if (document.getElementById('patientstemplate') !== null) {
        const templateHTML = document.getElementById(
          'patientstemplate').innerHTML
        querySnapshot.forEach((doc) => {
          const data = doc.data()

          let current = templateHTML.replace('{{id}}', doc.id).
            replace('{{name}}', data.name).
            replace('{{fingerprint}}', data.fingerprint)

          if (data.history.length > 0) {
            const id = doc.id
            const button = '<button onclick="showReport(this);"' +
              ' type="button"' +
              ` data-doc-id="${id}"` +
              ' class="text-white' +
              ' bg-blue-800 hover:bg-blue-700 focus:ring-4' +
              ' focus:ring-blue-300 font-medium rounded-lg text-sm px-5' +
              ' py-2.5  dark:bg-blue-600 dark:hover:bg-blue-700' +
              ' focus:outline-none dark:focus:ring-blue-800">Show' +
              ' History</button>'
            current = current.replace('{{historybutton}}', button)
          }

          output += current
        })

        document.getElementById('newoutput').innerHTML = output
      }
    })

  window.showReport = function (e) {
    firestore.getDoc(
      firestore.doc(db, '/patients/' + e.dataset.docId)).
      then((doc) => {
        const history = doc.data().history
        let output = ''

        if (history?.length) {
          history.forEach((item) => {
            let row = `
            <div class="flex flex-col border rounded-xl bg-gray-2 dark:bg-meta-4 sm:grid-cols-5 mb-8">
              <div class="p-2.5 xl:p-5">
                  Timestamp: <b class="text-green-700">${item.timestamp.toDate().
              toLocaleDateString()}</b><hr class="my-3">
                  Heart Rate: <b>${item.heart_rate}</b><br>
                  oxygen: <b>${item.oxygen}</b><br>
                  Temprature: <b>${item.temprature}</b>
              </div>
            </div>
            `

            output += row
          })
          document.getElementById('current_report').innerHTML = output
        }
      })
  }

})


