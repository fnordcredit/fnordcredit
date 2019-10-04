# Changelog

## v2.2.0

### Backend

* Updated the database scheme! Make sure to run `yarn knex migrate:latest`.
* Added gravatar support ([#49](https://github.com/fnordcredit/fnordcredit/issues/49))

### Frontend

#### Features

* Added an about view, that shows the current version and links to github
* Added avatars using Gravatar
* Added a user settings screen with two settings for now with more comming later:
  * Change your Avatar
  * Renaming
* Added a ka-ching sounds when a transaction is made

#### Minor Changes

* Made the last transactions panel collabsible for better responsibility
* Scanning an unknown barcode now displays an error message
* Updated all dependencies

## v2.1.0

### Backend

* Updated dependencies

### Frontend

* Updated to version 2.1.4.

#### Features

* New design following the material design guidelines
* Added an idle timeout that throws you back to the User List
* Huge Performance increase (Thanks to @marudor [#31](https://github.com/fnordcredit/frontend/pull/31))
* Added a loading animation to the user list
* Extended Barcode support allowing user barcodes and a "back" barcode to get back into the user list

#### Minor Changes

* Updated dependencies
* When adding a new user an auto focus will be put on the user name textfield
* Unified all error dialogs

#### Bug Fixes

* Fixed the error dialog when going below the debt limit ([#3](https://github.com/fnordcredit/frontend/issues/3))
* Fixed the margins of the user details view, especially on mobile devices ([#25](https://github.com/fnordcredit/frontend/issues/25))

## v2.0.0

* First release of the new Fnordcredit rewrite
