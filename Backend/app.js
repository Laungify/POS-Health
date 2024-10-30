const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const connection = require("./db");
const userSockets = require("./userSockets");
const { ExpressPeerServer } = require("peer");

const indexRouter = require("./routes/index");
const usersAPI = require("./api/users");
const companiesAPI = require("./api/companies");
const productsAPI = require("./api/products");
const registerAPI = require("./api/registrations");
const salesAPI = require("./api/sales");
const prescriptionAPI = require("./api/prescriptions");
const ordersAPI = require("./api/orders");
const shopsAPI = require("./api/shops");
const purchaseOrdersAPI = require("./api/purchase_orders");
const staffAPI = require("./api/staff");
const receiptAPI = require("./api/receipts");
const expenseAPI = require("./api/expenses");
const supplierAPI = require("./api/suppliers");
const stockAdjustmentAPI = require("./api/stockAdjustments");
const drugAPI = require("./api/drugs");
const transferAPI = require("./api/transfers");
const uploadAPI = require("./api/uploads");
const searchAPI = require("./api/search");
const newsletterRegistrationAPI = require("./api/newsletter_registrations");
const doctorAPI = require("./api/doctors");
const appointmentAPI = require("./api/appointments");
const medicationEncounterAPI = require("./api/medication_encounters");
const medicalNotesAPI = require("./api/medical_notes");


const corsOptions = {
  origin: [
    "https://www.afyabook.com",
    "https://modest-johnson-11fcc0.netlify.app",
    "http://localhost:8080",
    "http://localhost:8000",
    "http://localhost:9000",
  ],
};

const app = express();
const server = http.createServer(app); // Create an HTTP server using Express app

connection();

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors(corsOptions));

app.use("/", indexRouter);
app.use("/api/users", usersAPI);
app.use("/api/companies", companiesAPI);
app.use("/api/products", productsAPI);
app.use("/api/sales", salesAPI);
app.use("/api/orders", ordersAPI);
app.use("/api/prescriptions", prescriptionAPI);
app.use("/api/shops", shopsAPI);
app.use("/api/purchase_orders", purchaseOrdersAPI);
app.use("/api/staff", staffAPI);
app.use("/api/receipts", receiptAPI);
app.use("/api/expenses", expenseAPI);
app.use("/api/suppliers", supplierAPI);
app.use("/api/stockAdjustments", stockAdjustmentAPI);
app.use("/api/drugs", drugAPI);
app.use("/api/transfers", transferAPI);
app.use("/api/uploads", uploadAPI);
app.use("/api/searches", searchAPI);
app.use("/api/registrations", registerAPI);
app.use("/api/newsletter_registrations", newsletterRegistrationAPI);
app.use("/api/doctors", doctorAPI);
app.use("/api/appointments", appointmentAPI);
app.use("/api/medication_encounters", medicationEncounterAPI);
app.use("/api/clinical_notes", medicalNotesAPI);


app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log("🚀 ~ peer client connect", client);
});

peerServer.on("disconnect", (client) => {
  console.log("🚀 peer client disconnect", client);
});

// Middleware function to log incoming events
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//   },
// });
const io = socketIo(server, {
  cors: {
    origin: [
      "https://www.afyabook.com",
      "https://modest-johnson-11fcc0.netlify.app",
      "http://localhost:8080",
      "http://localhost:8000",
      "http://localhost:9000",
    ],
  },
});

io.use((socket, next) => {
  socket.onAny((event, ...args) => {
    console.log(`Received event '${event}' with data:`, args);
  });
  next();
});

const rooms = {};

io.on("connection", (socket) => {
  const clientOrigin = socket.request.headers.origin;
  console.log(`Client connected from: ${clientOrigin}`);

  socket.on("userConnect", (userId) => {
    if (userId) {
      userSockets.set(userId.toString(), socket);
      socket.id = userId;
      socket.emit("connectionSuccess");
      console.log("user connected ", userId);
    }
  });

  socket.on("joinRoom", ({ roomName, userId }) => {
    socket.join(roomName);
    if (!rooms[roomName]) {
      rooms[roomName] = new Set();
    }

    rooms[roomName].add(userId);

    io.in(roomName).emit("userJoined", {
      roomName,
      members: Array.from(rooms[roomName]),
    });

    /* io.emit("userJoined", { roomName, members: Array.from(rooms[roomName]) }); */
    rooms[roomName].forEach((member) => {
      const targetSocket = userSockets.get(member.toString());
      if (targetSocket) {
        targetSocket.emit("userJoined", {
          roomName,
          members: Array.from(rooms[roomName]),
        });
      }
    });
  });

  socket.on("leaveRoom", ({ roomName, userId }) => {
    console.log(`${userId} left room ${roomName}`);
    socket.leave(roomName);
    if (rooms[roomName]) {
      rooms[roomName].delete(userId);
      /* io.in(roomName).emit("userLeft", Array.from(rooms[roomName])); */
      rooms[roomName].forEach((member) => {
        const targetSocket = userSockets.get(member.toString());
        if (targetSocket) {
          targetSocket.emit("userLeft", Array.from(rooms[roomName]));
        }
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");

    // Remove the user from the userSockets map when they disconnect
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
