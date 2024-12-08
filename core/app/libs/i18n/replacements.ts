import en_us from './en_US';

type ReplacementsDefinition<T extends { [P in keyof typeof en_us]?: string }> = T;

/**
 * The following type is responsible for mapping certain I18N keys to
 * replacements so that we get strong argument typing for `T.toString` and
 * `T.toMarkdown`.
 *
 * Someday, this should be unnecessary as we'll be able to type these directly
 * from the JSON definitions.
 *
 * @see https://github.com/microsoft/TypeScript/issues/32063
 */
export type Replacements = ReplacementsDefinition<{
  'login.request_new_link_app': 'appName';
  'login.go_back_to_app': 'appName';
  'login.logged_into_app': 'appName';
  'login.send_another_magic_link_to_email': 'userEmail';
  'login.please_wait_x_seconds': 'seconds';
  'login.please_send_another_link': 'userEmail';
  'login.appname_confirming_your_login': 'appName';
  'login.app_is_private': 'appName';
  'login.cannot_access_private_app': 'userEmail';
  'login.think_theres_a_mistake': 'appName';
  'login.email_blocked_message': 'appName';
  'login.mau_limit_exceeded_description': 'appName';
  'login.enter_the_security_code_displayed_by': 'appName';
  'login.to_receive_a_new_code_please_return_to_app': 'appName';

  'verify_device.rejected_login_mistake': 'appName';
  'verify_device.go_back_to_finish_login': 'appName';
  'verify_device.send_another_magic_link_to_email': 'userEmail';

  'generic.please_contact_app_devs_app': 'appName';

  'update_email.confirm_current_email': 'userEmail';
  'update_email.we_sent_an_email_to_new_email': 'updatedUserEmail';
  'update_email.please_wait_x_seconds': 'seconds';
  'update_email.update_request_failed': 'updatedEmail';
  'update_email.go_back_to_original_appname_tab': 'appName';
  'update_email.go_back_to_your_original_app_tab_and_restart': 'appName';
  'update_email.to_finish_updating_confirm_current_email': 'currentEmail';
  'update_email.appname_confirming_email_update': 'appName';

  'email_preview.click_button_below_to_app': 'appName';
  'email_preview.login_to_app': 'appName';
  'email_preview.app_team': 'appName';

  'pnp.login_using_aria': 'provider';
  'pnp.contact_app_for_help': 'appName';
  'pnp.browsewrap_text': 'appName';

  'mfa.prompt_authenticator_copy': 'google' | 'authy';
  'mfa.recovery_code_label': 'appName';
  'mfa.lost_recovery_code_contact': 'appName';
  'mfa.lost_recovery_code_body': 'appName';
  'mfa.max_attempt_warning_msg': 'attempts';

  'settings.back_to_app': 'appName';
  'generic.app_name_needs_an_upgrade_to_use_widget_ui': 'appName';
}>;
