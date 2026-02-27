const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM Users WHERE id = ?', [id], (err, row) => {
        if (err) return done(err);
        done(null, row);
    });
});

const clientID = process.env.GOOGLE_CLIENT_ID || 'DUMMY_CLIENT_ID';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'DUMMY_CLIENT_SECRET';
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: `${baseURL}/auth/google/callback`
},
    (accessToken, refreshToken, profile, done) => {
        // Find or create user
        db.get('SELECT * FROM Users WHERE googleId = ?', [profile.id], (err, user) => {
            if (err) return done(err);

            if (user) {
                if (user.isBanned) {
                    return done(null, false, { message: 'Sua conta foi banida por infrações.' });
                }
                return done(null, user);
            } else {
                // New user registration
                const name = profile.displayName || '';
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
                const photoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
                const role = (email === 'lucasmorforio@gmail.com' || email === 'lucasmorforio.niuai@gmail.com') ? 'big_boss' : 'feed_user';

                db.run(
                    'INSERT INTO Users (googleId, name, email, photoUrl, role) VALUES (?, ?, ?, ?, ?)',
                    [profile.id, name, email, photoUrl, role],
                    function (err) {
                        if (err) return done(err);
                        const newUser = { id: this.lastID, googleId: profile.id, name, email, photoUrl, isBanned: 0, role: role };
                        return done(null, newUser);
                    }
                );
            }
        });
    }
));

module.exports = passport;
