const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

exports.generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

exports.generateRefreshToken = (userId) => {
    const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    // Store refreshToken in the database
    db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days from now
    );
    return refreshToken;
};

exports.generateAccessTokenWithCookie = (res, userId) => {
    const accessToken = exports.generateAccessToken(userId);
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        signed: true,
        maxAge: 900000 // milliseconds
    });
    return accessToken;
};

exports.generateRefreshTokenWithCookie = async (res, userId) => {
    const refreshToken = exports.generateRefreshToken(userId);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        signed: true,
        maxAge: 604800000 // milliseconds
    });
    return refreshToken;
};

exports.clearCookies = (res) => {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', signed: true });
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'Strict', signed: true });
};