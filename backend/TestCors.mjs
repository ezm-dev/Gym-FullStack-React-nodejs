// fetch("http://localhost:8080/api/users/8",
//     {
//         method: "PUT",
//         headers: {
//             "Content-Type":"application/json",
//             "x-auth-key": "f643033a-732d-4f57-8e34-afaade8d40c4"

//         },
//         body: JSON.stringify({
//         "firstName": "TEST",
//         "lastName": "Cors",
//         "email": "testcors@t.com",
//         "password": "Abcd1234*",
//         "role": "admin",
//         "deleted": 0
//         })
//     }
// ).then(res => res.json())
// .then(body => console.log(body))

// ----
// fetch("http://localhost:8080/api/posts/55", {
//   method: "DELETE",
//   headers: { 
//     "x-auth-key": "540b77b9-ee10-40d2-ba76-66a0c4feb069"
//  }
// })
// .then(res => res.json())
// .then(body =>console.log(body));

// - POST--
// fetch("http://localhost:8080/api/posts", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//          "x-auth-key": "f643033a-732d-4f57-8e34-afaade8d40c4"
       
//     },
//     body: JSON.stringify({

//   "userId": 10,
//   "title": "TEST Cors",
//   "content": "Test Cors post.",
//   "date": "2025-05-11"
// })
// })
// .then(res => res.json())
// .then(body => console.log(body));


// --GET--
// fetch("http://localhost:8080/api/xml/bookings",{
//     headers: {
//         "x-auth-key": "540b77b9-ee10-40d2-ba76-66a0c4feb069"
//     }
// })
// .then(res => res.json())
// .then(body => console.log(body));


// fetch(`http://localhost:8080/api/sessions/calendar?start_date=${startDate}&end_date=${endDate}`,{
//     headers: {
//         "x-auth-key": "e9da4584-9646-4f7b-8e78-337adf463a4a"
//     }
// })
// .then(res => res.json())
// .then(body => console.log(body));

