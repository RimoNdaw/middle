const thrift = require('thrift');
const express = require('express');
const bodyParser = require('body-parser');
const TokenApi = require('./gen-nodejs/TokenApi');
const ttypes = require('./gen-nodejs/prismtoken_types');

// Création dynamique du client Thrift
function getThriftClient() {
  const connection = thrift.createSSLConnection("pt-vend.prismcrypto.co.za", 9443, {
    transport: thrift.TFramedTransport,
    protocol: thrift.TBinaryProtocol,
    rejectUnauthorized: false,
  });

  connection.on('error', (err) => {
    console.error('Erreur de connexion Thrift :', err);
  });

  return thrift.createClient(TokenApi, connection);
}

const app = express();
app.use(bodyParser.json());

// 🔐 Sign-in
app.post('/signin', async (req, res) => {
  const client = getThriftClient();

  try {
    const result = await client.signInWithPassword(
      req.body.messageId,
      "local",
      req.body.username,
      req.body.password,
      { version: "1.0" }
    );

    console.log('✅ Résultat signInWithPassword :', result);

    if (result && result.token) {
      res.json({ token: result.token });
    } else {
      res.status(500).json({ error: 'Token manquant dans la réponse.' });
    }

  } catch (e) {
    console.error('❌ Erreur /signin :', e);
    res.status(500).json({ error: e.message });
  }
});

// 🎟️ issueCreditToken
app.post('/issueCreditToken', async (req, res) => {
  const client = getThriftClient();
  const {
    messageId, accessToken, meterConfig,
    subclass, transferAmount, tokenTime, flags
  } = req.body;

  try {
    if (!messageId || !accessToken || !meterConfig ||
        subclass === undefined || transferAmount === undefined ||
        tokenTime === undefined || flags === undefined) {
      throw new Error("Champs requis manquants.");
    }

    const { drn, Krn, ea, tct, Sgc, Ti, ken } = meterConfig;

    const meterInput = new ttypes.MeterConfigIn({
      drn: String(drn),
      Krn: Number(Krn),
      ea: Number(ea),
      tct: Number(tct),
      Sgc: Number(Sgc),
      Ti: Number(Ti),
      ken: Number(ken)
    });

    const result = await client.issueCreditToken(
      String(messageId),
      String(accessToken),
      meterInput,
      Number(subclass),
      Number(transferAmount),
      Number(tokenTime),
      Number(flags)
    );

    console.log('✅ Réponse issueCreditToken :', result);
    res.json(result);

  } catch (error) {
    console.error("[/issueCreditToken] Erreur :", error);
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// ⚡ issueMseToken
app.post('/issueMseToken', async (req, res) => {
  const client = getThriftClient();
  const {
    messageId, accessToken, meterConfig,
    subclass, transferAmount, tokenTime, flags
  } = req.body;

  try {
    if (!messageId || !accessToken || !meterConfig ||
        subclass === undefined || transferAmount === undefined ||
        tokenTime === undefined || flags === undefined) {
      throw new Error("Champs requis manquants.");
    }

    const { drn, Krn, ea, tct, Sgc, Ti, ken } = meterConfig;

    const meterInput = new ttypes.MeterConfigIn({
      drn: String(drn),
      Krn: Number(Krn),
      ea: Number(ea),
      tct: Number(tct),
      Sgc: Number(Sgc),
      Ti: Number(Ti),
      ken: Number(ken)
    });

    const result = await client.issueCreditToken(
      String(messageId),
      String(accessToken),
      meterInput,
      Number(subclass),
      Number(transferAmount),
      Number(tokenTime),
      Number(flags)
    );

    console.log('✅ Réponse issueMseToken :', result);
    res.json(result);

  } catch (error) {
    console.error("[/issueMseToken] Erreur :", error);
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 🔐 issueKeyChangeTokens
app.post('/issueKeyChangeTokens', async (req, res) => {
  const client = getThriftClient();
  const {
    messageId, accessToken, meterConfig, newConfig,
    transferAmount, tokenTime, flags
  } = req.body;

  try {
    if (!messageId || !accessToken || !meterConfig || !newConfig) {
      throw new Error("Champs requis manquants.");
    }

    const { drn, Krn, ea, tct, Sgc, Ti, ken } = meterConfig;
    const { toSgc, toKrn, toTi } = newConfig;

    const meterInput = new ttypes.MeterConfigIn({
      drn: String(drn),
      Krn: Number(Krn),
      ea: Number(ea),
      tct: Number(tct),
      Sgc: Number(Sgc),
      Ti: Number(Ti),
      ken: Number(ken)
    });

    const newConfigInput = new ttypes.MeterConfigAmendment({
      toSgc: Number(toSgc),
      toKrn: Number(toKrn),
      toTi: Number(toTi)
    });

    const result = await client.issueKeyChangeTokens(
      String(messageId),
      String(accessToken),
      meterInput,
      newConfigInput
    );

    console.log('✅ Réponse issueKeyChangeTokens :', result);
    res.json(result);

  } catch (error) {
    console.error("[/issueKeyChangeTokens] Erreur :", error);
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 🔍 Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

setInterval(() => {
  fetch('http://prism-cva-middleware-25934cf964de.herokuapp.com'); // remplace par ton vrai lien Heroku
}, 5 * 60 * 1000); // toutes les 5 minutes

// 🚀 Démarrage serveur
const PORT = process.env.PORT || 4008;
app.listen(PORT, () => {
  console.log(`✅ Middleware démarré sur http://localhost:${PORT}`);
});
