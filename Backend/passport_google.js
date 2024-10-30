const passport = require("passport");
const passportGoogle = require("passport-google-oauth20");
const GoogleStrategy = passportGoogle.Strategy;
const User = require("./models/user");

const options = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
};

const getProfile = (profile) => {
  const { id, name, emails, provider } = profile;
  if (emails && emails.length) {
    const email = emails[0].value;
    return {
      googleId: id,
      firstName: name.familyName,
      lastName: name.givenName,
      email,
      isEmailVerified: true,
    };
  }
  return null;
};

passport.use(
  new GoogleStrategy(
    options,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingGoogleUser = await User.findOne({
          googleId: profile.id,
        });
        if (!existingGoogleUser) {
          const email = getProfile(profile).email;
          const existingEmailUser = await User.findOne({
            email,
          });
          // Create user if he is not registered already

          if (!existingEmailUser) {
            const newUser = await User.create(getProfile(profile));

            return done(null, newUser);
          }
          return done(null, existingEmailUser);
        }
        return done(null, existingGoogleUser);
      } catch (e) {
        throw new Error(e);
      }
    }
  )
);
