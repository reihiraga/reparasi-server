const User = require("../models/User");
const Ticket = require("../models/Ticket");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res) => {
  // query untuk ambil data user
  const users = await User.find().select("-password").lean();

  // validasi jika tidak ada user
  if (!users?.length) {
    return res.status(400).json({ message: "Tidak ada user yang ditemukan" });
  }

  // bentuk return jika ada user
  res.json(users);
});

const createUser = asyncHandler(async (req, res) => {
  // destructure body dari client
  const { username, password, roles } = req.body;

  // validasi kelengkapan data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "Semua atribut harus terisi!" });
  }

  // validasi duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(400).json({ message: "Username sudah ada." });
  }

  // proses enkripsi password
  const pwdHash = await bcrypt.hash(password, 10);

  const user = await User.create({ username, password: pwdHash, roles });

  if (user) {
    res.status(201).json({ message: `User:${username} telah dibuat!` });
  } else {
    res.status(400).json({ message: "Gagal membuat user baru." });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  // destructuring
  const { id, username, roles, active, password } = req.body;
  console.log("Received payload:", req.body);
  // validasi kelengkapan data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // validasi existing data
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User tidak ditemukan" });
  }

  // validasi duplicate username
  const duplicate = await User.findOne({ username }).lean().exec();

  // memperbolehkan admin untuk meng-update username pada user dengan id sama.
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Username sudah ada" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  // jika ingin meng-update password
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.id} diperbarui.` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // validasi kelengkapan data
  if (!id) {
    return res.status(400).json({ message: "ID diperlukan" });
  }

  // validasi ada tiket atau gak
  const ticket = await Ticket.findOne({ user: id }).lean().exec();

  if (ticket) {
    return res
      .status(400)
      .json({ message: "User masih memiliki task/ticket!" });
  }

  // check user exist
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User tidak ditemukan" });
  }

  const result = await user.deleteOne();

  res.json({ message: `User dengan ${result.id} berhasil dihapus!` });
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
