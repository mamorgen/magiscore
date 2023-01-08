﻿/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
 * Contributor Bhumin Bhandari
 *
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 */

namespace LocalNotificationProxy.LocalNotification.Toast
{
    public sealed class Input : IAction
    {
        /// <summary>
        /// Gets or sets the ID.
        /// </summary>
        public string ID { get; set; }

        /// <summary>
        /// Gets or sets the title.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the title of the submit button.
        /// </summary>
        public string SubmitTitle { get; set; }

        /// <summary>
        /// Gets or sets placeholder text.
        /// </summary>
        public string EmptyText { get; set; }

        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        public string DefaultValue { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether to launch the app.
        /// </summary>
        public bool Launch { get; set; } = true;
    }
}
