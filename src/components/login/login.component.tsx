import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { signIn } from 'next-auth/client';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ImageIcon from '@material-ui/icons/Image';

import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { KeypairType } from '@polkadot/util-crypto/types';

import DialogTitle from '../common/DialogTitle.component';
import CaptchaComponent from '../common/captcha.component';
import ShowIf from '../common/show-if.component';
import LoginMethod from './login-method.component';
import { useStyles } from './login.style';

import { usePolkadotExtension } from 'src/hooks/use-polkadot-app.hook';
import { uniqueNamesGenerator, adjectives, colors } from 'unique-names-generator';

export type SeedType = 'json' | 'bip' | 'raw';

export interface AddressState {
  seed: string;
  seedType: SeedType;
}

type Props = {
  allowAnonymous?: boolean;
};

export default function LoginComponent({ allowAnonymous = true }: Props) {
  const style = useStyles();
  const [, setCookie] = useCookies(['seed']);

  const { accountFetched, isExtensionInstalled, accounts, getPolkadotAccounts, unsubscribeFromAccounts } = usePolkadotExtension();
  const [isSignin, setSignin] = useState(false);
  const [shouldShowLoginMethod, showLoginMethod] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showLoginAnonymouslyDialog, setShowLoginAnonymouslyDialog] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [address, storeAddress] = useState<AddressState>({
    seed: '',
    seedType: 'bip'
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    // if on signin and only one accounts available, log in the available account
    if (isSignin && accountFetched && accounts.length === 1) {
      signIn('credentials', {
        address: accounts[0].address,
        name: accounts[0].meta.name,
        anonymous: false,
        callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/home'
      });
    }

    return () => {
      // Clean up the subscription
      unsubscribeFromAccounts();
    };
  }, [isSignin, accountFetched, accounts]);

  const toggleLogin = (method: SeedType | null) => {
    if (method) {
      storeAddress({
        seedType: method,
        seed: ''
      });
      showLoginMethod(true);
    } else {
      showLoginMethod(false);
    }
  };

  const saveData = (data: string) => {
    showLoginMethod(false);
    storeAddress({
      ...address,
      seed: data
    });
  };

  const createAccount = () => {
    setShowCreateAccount(true);
  };

  const closeCreateAccount = () => {
    setShowCreateAccount(false);
    setCaptchaVerified(false);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setAccountName(value);
  };

  const login = async () => {
    const prefix = process.env.NEXT_PUBLIC_POLKADOT_KEYRING_PREFIX ? Number(process.env.NEXT_PUBLIC_POLKADOT_KEYRING_PREFIX) : 214;
    const cyptoType: KeypairType = process.env.NEXT_PUBLIC_POLKADOT_CRYPTO_TYPE
      ? (process.env.NEXT_PUBLIC_POLKADOT_CRYPTO_TYPE as KeypairType)
      : 'sr25519';
    const derivationPath = process.env.NEXT_PUBLIC_POLKADOT_DERIVATION_PATH || '';

    const keyring = new Keyring({ type: cyptoType, ss58Format: prefix });
    const seed = mnemonicGenerate();

    const pair: KeyringPair = keyring.createFromUri(seed + derivationPath, { name: accountName });

    setCookie('uri', seed);

    await signIn('credentials', {
      address: pair.address,
      name: accountName,
      anonymous: false,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/home',
      redirect: true
    });
  };

  const showLoginAnonymously = () => {
    setShowLoginAnonymouslyDialog(true);
  };

  const closeLoginAnonymously = () => {
    setShowLoginAnonymouslyDialog(false);
  };

  const loginAnonymous = async () => {
    const randomName: string = uniqueNamesGenerator({
      dictionaries: [adjectives, colors],
      separator: ' '
    });

    await signIn('credentials', {
      address: null,
      name: randomName,
      anonymous: true,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/home',
      redirect: true
    });
  };

  const signinWithAccount = async (account: InjectedAccountWithMeta) => {
    await signIn('credentials', {
      address: account.address,
      name: account.meta.name,
      anonymous: false,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/home',
      redirect: true
    });
  };

  const getCaptchaVerification = (isVerified: boolean) => {
    setCaptchaVerified(isVerified);
  };

  const getPolkadotAppAccounts = async () => {
    setSignin(true);
    getPolkadotAccounts();
  };

  const cancelSignin = () => {
    setSignin(false);
  };

  return (
    <>
      <Paper className={style.paper} variant="elevation" elevation={2}>
        <Grid item>
          <Typography className={style.title} component="h1" variant="h4">
            Log in
          </Typography>
          <div className={style.action}>
            <ButtonGroup orientation="vertical" fullWidth>
              <Button
                onClick={getPolkadotAppAccounts}
                className={style.button}
                color="default"
                size="large"
                fullWidth={true}
                variant="contained">
                Sign In
              </Button>

              <Button className={style.button} color="default" size="large" variant="contained" fullWidth={true}>
                Remind me how this works again?
              </Button>
            </ButtonGroup>
          </div>
        </Grid>

        <Grid item>
          <div className={style.action}>
            <Button color="secondary" fullWidth={true} size="large" variant="contained" onClick={createAccount}>
              Create A New Account
            </Button>
            <ShowIf condition={allowAnonymous}>
              <Button className={style.lightButton} fullWidth={true} size="large" variant="contained" onClick={showLoginAnonymously}>
                Get In Anonymously
              </Button>
            </ShowIf>
          </div>
        </Grid>
      </Paper>

      <LoginMethod show={shouldShowLoginMethod} method={address.seedType} onSave={saveData} onCancel={() => toggleLogin(null)} />

      <Dialog open={showCreateAccount} onClose={closeCreateAccount} aria-labelledby="form-dialog-title" maxWidth="md">
        <DialogTitle id="name" onClose={closeCreateAccount}>
          Create a new Account.
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            onChange={handleNameChange}
            variant="filled"
            color="secondary"
            margin="dense"
            id="name"
            label="What's your name?"
            type="text"
            fullWidth
          />
        </DialogContent>

        <DialogContent>
          <CaptchaComponent getCaptchaVerification={getCaptchaVerification} />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={accountName.length === 0 || !captchaVerified}
            onClick={login}
            variant="contained"
            color="secondary"
            fullWidth
            className={style.btnCreateAccount}>
            Get in
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showLoginAnonymouslyDialog} onClose={closeLoginAnonymously} aria-labelledby="form-dialog-title" maxWidth="md">
        <DialogTitle id="name" onClose={closeLoginAnonymously}>
          Please verify the reCAPTCHA first.
        </DialogTitle>
        <DialogContent>
          <CaptchaComponent getCaptchaVerification={getCaptchaVerification} />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!captchaVerified}
            className={style.lightButton}
            fullWidth={true}
            size="large"
            variant="contained"
            onClick={loginAnonymous}>
            Get in anonymously
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isSignin && accountFetched && accounts.length === 0} aria-labelledby="no-extension-account" maxWidth="xs">
        <DialogTitle id="name" onClose={cancelSignin}>
          Extension Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            No accounts found on your Polkadot Extension. Please create account on Myriad app then import the account to Polkadot Extension.
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignin && !isExtensionInstalled} aria-labelledby="no-extension-installed" maxWidth="xs">
        <DialogTitle id="name" onClose={cancelSignin}>
          Extension Not Found
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" className={style.info}>
            {' '}
            Polkadot Extension was not found or disabled. Please enable the extension or install it from the links below.
          </Typography>
          <Typography variant="body1" className={style.info}>
            <Link href="https://polkadot.js.org/extension" variant="body1" color="textSecondary" className={style.polkadot}>
              {'Polkadot{.js}'} Extension official site.
            </Link>
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignin && accountFetched && accounts.length > 1} aria-labelledby="choose-account" maxWidth="sm">
        <DialogTitle id="name" onClose={cancelSignin}>
          Choose an account to sign in
        </DialogTitle>
        <DialogContent>
          <List className={style.info}>
            {accounts.map(account => {
              return (
                <ListItem button onClick={() => signinWithAccount(account)}>
                  <ListItemAvatar>
                    <Avatar>
                      <ImageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={account.meta.name} secondary={account.address} />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
