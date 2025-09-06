<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyD48mRL359S6nViO9GZnXWdaeADFjt4nWc",
    authDomain: "studentproductivity-4ea51.firebaseapp.com",
    projectId: "studentproductivity-4ea51",
    storageBucket: "studentproductivity-4ea51.firebasestorage.app",
    messagingSenderId: "1025945034124",
    appId: "1:1025945034124:web:458fbb5e6b08abd7e30aa9",
    measurementId: "G-F422GLRQK1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>