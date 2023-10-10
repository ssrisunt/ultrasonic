import component from '@/locales/en-US/component';
import globalHeader from '@/locales/en-US/globalHeader';
import menu from '@/locales/en-US/menu';
import pwa from '@/locales/en-US/pwa';
import settingDrawer from '@/locales/en-US/settingDrawer';
import settings from '@/locales/en-US/settings';
import pages from '@/locales/en-US/pages';

export default {
  'navBar.lang': 'Language',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to the local project',
  'app.welcome.link.fetch-blocks': 'Get all blocks',
  'app.welcome.link.block-list': 'Based on block development, quickly build standard pages',
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
};
