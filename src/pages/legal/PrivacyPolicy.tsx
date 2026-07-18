import { LegalLayout, H2, P, Ul, Muted } from './LegalLayout'

const en = (
  <>
    <Muted>
      Draft for legal review. Intended to align with Egypt's Personal Data Protection Law
      (Law No. 151 of 2020, the "PDPL") and its executive regulations, and with Apple App
      Store and Google Play requirements. An official Arabic version will be issued and,
      for Egyptian users, the Arabic text prevails.
    </Muted>

    <P>
      <strong>Data controller:</strong> [YOUR FULL LEGAL NAME], a sole proprietor trading
      as "Lamha", Individual Commercial Register No. [COMMERCIAL REGISTER NO.],
      [REGISTERED ADDRESS], Egypt.
      <br />
      <strong>Contact:</strong> WhatsApp +20 106 027 0197 · [SUPPORT EMAIL]
    </P>

    <H2>1. Who we are</H2>
    <P>
      Lamha ("we", "us") operates the Lamha mobile application, an AI photo studio that
      enhances, restores and styles photos and, optionally, delivers printed products. This
      policy explains what personal data we process, why, and your rights.
    </P>

    <H2>2. Data we process</H2>
    <Ul>
      <li>
        <strong>Account data:</strong> phone number (for phone/OTP sign-in), and — if you
        use social sign-in — the name and email your provider shares. Guests use an
        anonymous session until they sign up.
      </li>
      <li>Photos and content you upload, and the AI results generated from them.</li>
      <li>
        <strong>Order and delivery data:</strong> delivery address, landmark, contact
        phone, order history and status.
      </li>
      <li>
        <strong>Payment metadata:</strong> transaction identifiers and status. We never
        receive or store your full card details — card and wallet payments are handled by
        our payment processor; subscription payments are handled by Apple/Google.
      </li>
      <li>
        <strong>Device and usage data:</strong> device model, OS, app version, language,
        crash diagnostics and in-app events used to operate and improve the service.
      </li>
      <li>Support communications you send us.</li>
    </Ul>

    <H2>3. Why we process it (purposes &amp; legal basis)</H2>
    <P>
      We process data on the basis of your <strong>consent</strong> and of the{' '}
      <strong>necessity to perform the service</strong> you request, and to comply with{' '}
      <strong>legal obligations</strong>:
    </P>
    <Ul>
      <li>to create your account and let you use the app;</li>
      <li>to run the AI enhancement you ask for and show/save the result;</li>
      <li>to fulfil, deliver and support print orders;</li>
      <li>to process payments and prevent fraud;</li>
      <li>to moderate content for safety and legal compliance (see §6);</li>
      <li>to provide customer support;</li>
      <li>to understand usage and improve the product (aggregated analytics);</li>
      <li>to meet accounting, tax and other legal requirements.</li>
    </Ul>

    <H2>4. AI processing of your photos</H2>
    <Ul>
      <li>
        Your photo is processed by automated AI models to produce the result you
        requested. Processing may be performed by third-party AI providers acting as our
        processors (see §7), which may be located outside Egypt; by using the AI features
        you consent to this transfer for that purpose.
      </li>
      <li>
        We do not use your photos to train AI models, and we do not use them for
        marketing or any purpose beyond fulfilling your own request, without your
        separate, explicit opt-in consent.
      </li>
      <li>Results are labelled as AI-enhanced in the app.</li>
    </Ul>

    <H2>5. Third-party photo consent</H2>
    <P>
      Many photos include people other than the account holder (for example, family or
      wedding photos). By uploading an image of any third party, you confirm you have the
      right to use it and to have it processed as described here. Do not upload images of
      others without their permission.
    </P>

    <H2>6. Content moderation</H2>
    <P>
      To comply with law and store policies, uploaded images may be screened by an
      automated safety classifier, and flagged content may be reviewed by our staff before
      any print is produced. We do not knowingly process unlawful content.
    </P>

    <H2>7. Who we share data with (processors)</H2>
    <P>
      We share the minimum necessary data with service providers who process it on our
      behalf under contract:
    </P>
    <Ul>
      <li>AI providers (image processing);</li>
      <li>Payment processor (card/wallet payments) and Apple/Google (subscriptions);</li>
      <li>Courier/print partners (to fulfil and deliver orders);</li>
      <li>Cloud/hosting, analytics and crash-reporting providers (to run and improve the app).</li>
    </Ul>
    <P>We may also disclose data where required by law or to protect our rights.</P>

    <H2>8. International transfers</H2>
    <P>
      Some processors operate outside Egypt. Where personal data is transferred abroad, we
      rely on your consent and/or appropriate safeguards as required by the PDPL and its
      executive regulations.
    </P>

    <H2>9. Retention</H2>
    <Ul>
      <li>
        Photos and results are retained while your account is active or until you delete
        them (Gallery → delete).
      </li>
      <li>
        On account deletion, your photos, results and personal data are permanently
        deleted within 30 days, except records we must keep by law (e.g. financial records
        tied to a completed order).
      </li>
    </Ul>

    <H2>10. Your rights (PDPL)</H2>
    <P>
      Subject to the PDPL, you may access, correct, update or delete your data, object to
      or restrict certain processing, withdraw consent, and request portability. You can
      delete your account in-app (Profile → Delete account) or contact us. You may also
      complain to Egypt's Data Protection Center.
    </P>

    <H2>11. Security</H2>
    <P>
      We apply technical and organisational measures including encryption in transit,
      access controls and row-level database security. No system is perfectly secure, but
      we work to protect your data and to notify you and the authorities of any breach as
      required by law.
    </P>

    <H2>12. Children</H2>
    <P>
      Lamha is not directed to children under 18. If you believe a child has provided us
      data, contact us and we will delete it.
    </P>

    <H2>13. Changes</H2>
    <P>
      We may update this policy; we will post the new effective date and, for material
      changes, notify you in-app.
    </P>

    <H2>14. Contact</H2>
    <P>
      Questions or requests: <strong>WhatsApp +20 106 027 0197</strong> · [SUPPORT EMAIL] ·
      [YOUR FULL LEGAL NAME], trading as "Lamha", [REGISTERED ADDRESS], Egypt.
    </P>
  </>
)

const ar = (
  <>
    <Muted>
      مسودة قيد المراجعة القانونية. تم إعدادها بما يتماشى مع قانون حماية البيانات الشخصية
      المصري (القانون رقم 151 لسنة 2020) ولائحته التنفيذية، وكذلك متطلبات Apple App Store و
      Google Play. هذا هو النص العربي الرسمي المعتمد لمستخدمي مصر.
    </Muted>

    <P>
      <strong>الجهة المتحكمة في البيانات:</strong> [اسمك الكامل كما هو مسجل]، منشأة
      فردية باسم تجاري "لمحة"، سجل تجاري فردي رقم [رقم السجل التجاري]، [العنوان المسجل]،
      جمهورية مصر العربية.
      <br />
      <strong>للتواصل:</strong> واتساب ٠١٠٦٠٢٧٠١٩٧+20 · [البريد الإلكتروني للدعم]
    </P>

    <H2>١. من نحن</H2>
    <P>
      تُشغّل "لمحة" ("نحن") تطبيق لمحة للهواتف المحمولة، وهو استوديو صور بالذكاء الاصطناعي
      يقوم بتحسين الصور وترميمها وتنسيقها فنيًا، ويوفر اختياريًا خدمة طباعة وتوصيل المنتجات.
      توضح هذه السياسة البيانات الشخصية التي نعالجها، ولماذا، وما هي حقوقك.
    </P>

    <H2>٢. البيانات التي نعالجها</H2>
    <Ul>
      <li>
        <strong>بيانات الحساب:</strong> رقم الهاتف (لتسجيل الدخول عبر رمز التحقق)، وإذا
        استخدمت تسجيل الدخول عبر منصات التواصل الاجتماعي، الاسم والبريد الإلكتروني الذي
        يشاركه مزود الخدمة. يستخدم الزوار جلسة مجهولة الهوية حتى يقوموا بالتسجيل.
      </li>
      <li>الصور والمحتوى الذي ترفعه، ونتائج الذكاء الاصطناعي المُولّدة منها.</li>
      <li>
        <strong>بيانات الطلب والتوصيل:</strong> عنوان التوصيل، أقرب علامة مميزة، رقم هاتف
        التواصل، تاريخ الطلبات وحالتها.
      </li>
      <li>
        <strong>بيانات الدفع الوصفية:</strong> معرّفات وحالة العمليات المالية. نحن لا نتلقى
        أو نخزّن بيانات بطاقتك الكاملة أبدًا — يتم التعامل مع مدفوعات البطاقات والمحافظ
        الإلكترونية عبر معالج الدفع الخاص بنا، بينما تتم فوترة الاشتراكات عبر Apple/Google.
      </li>
      <li>
        <strong>بيانات الجهاز والاستخدام:</strong> طراز الجهاز، نظام التشغيل، إصدار
        التطبيق، اللغة، تقارير الأعطال، وأحداث الاستخدام داخل التطبيق لتشغيل الخدمة وتحسينها.
      </li>
      <li>مراسلات الدعم الفني التي ترسلها لنا.</li>
    </Ul>

    <H2>٣. لماذا نعالج بياناتك (الأغراض والأساس القانوني)</H2>
    <P>
      نعالج بياناتك بناءً على <strong>موافقتك</strong>، وعلى <strong>ضرورة تنفيذ الخدمة</strong>{' '}
      التي تطلبها، وللامتثال <strong>للالتزامات القانونية</strong>:
    </P>
    <Ul>
      <li>لإنشاء حسابك وتمكينك من استخدام التطبيق؛</li>
      <li>لتشغيل تحسين الذكاء الاصطناعي الذي تطلبه وعرض/حفظ النتيجة؛</li>
      <li>لتنفيذ وتوصيل ودعم طلبات الطباعة؛</li>
      <li>لمعالجة المدفوعات ومنع الاحتيال؛</li>
      <li>لمراجعة المحتوى لأغراض السلامة والامتثال القانوني (انظر البند ٦)؛</li>
      <li>لتقديم الدعم الفني للعملاء؛</li>
      <li>لفهم أنماط الاستخدام وتحسين المنتج (تحليلات مجمّعة)؛</li>
      <li>للوفاء بالمتطلبات المحاسبية والضريبية والقانونية الأخرى.</li>
    </Ul>

    <H2>٤. معالجة صورك بالذكاء الاصطناعي</H2>
    <Ul>
      <li>
        تتم معالجة صورتك بواسطة نماذج ذكاء اصطناعي آلية لإنتاج النتيجة التي طلبتها. قد تتم
        المعالجة بواسطة مزودي خدمة ذكاء اصطناعي من طرف ثالث يعملون كمعالجين نيابة عنا (انظر
        البند ٧)، وقد يكونون خارج مصر؛ باستخدامك لميزات الذكاء الاصطناعي فإنك توافق على هذا
        النقل لهذا الغرض تحديدًا.
      </li>
      <li>
        نحن لا نستخدم صورك لتدريب نماذج الذكاء الاصطناعي، ولا نستخدمها لأغراض تسويقية أو أي
        غرض يتجاوز تنفيذ طلبك، دون موافقتك الصريحة والمنفصلة على ذلك.
      </li>
      <li>يتم تمييز النتائج داخل التطبيق بأنها "مُحسّنة بالذكاء الاصطناعي".</li>
    </Ul>

    <H2>٥. موافقة الطرف الثالث على الصور</H2>
    <P>
      تتضمن الكثير من الصور أشخاصًا آخرين غير صاحب الحساب (كصور العائلة أو الزفاف مثلًا).
      برفعك لصورة تتضمن طرفًا ثالثًا، فإنك تقر بأن لديك الحق في استخدامها ومعالجتها كما هو
      موضح هنا. يُرجى عدم رفع صور الآخرين دون إذنهم.
    </P>

    <H2>٦. مراجعة المحتوى</H2>
    <P>
      امتثالًا للقانون وسياسات المتاجر، قد يتم فحص الصور المرفوعة بواسطة مصنّف آلي للسلامة،
      وقد يراجع فريقنا أي محتوى مُعلَّم قبل طباعته. نحن لا نعالج عن علم أي محتوى مخالف
      للقانون.
    </P>

    <H2>٧. مع من نشارك البيانات (المعالجون)</H2>
    <P>نُشارك الحد الأدنى الضروري من البيانات مع مزودي خدمة يعالجونها نيابة عنا بموجب عقد:</P>
    <Ul>
      <li>مزودو خدمة الذكاء الاصطناعي (معالجة الصور)؛</li>
      <li>معالج الدفع (مدفوعات البطاقات والمحافظ) و Apple/Google (الاشتراكات)؛</li>
      <li>شركاء التوصيل والطباعة (لتنفيذ وتوصيل الطلبات)؛</li>
      <li>مزودو الاستضافة السحابية والتحليلات وتقارير الأعطال (لتشغيل التطبيق وتحسينه).</li>
    </Ul>
    <P>قد نفصح أيضًا عن البيانات عند الالتزام القانوني بذلك أو لحماية حقوقنا.</P>

    <H2>٨. النقل الدولي للبيانات</H2>
    <P>
      يعمل بعض المعالجين خارج مصر. عند نقل البيانات الشخصية للخارج، نعتمد على موافقتك و/أو
      الضمانات المناسبة التي يتطلبها قانون حماية البيانات الشخصية ولائحته التنفيذية.
    </P>

    <H2>٩. مدة الاحتفاظ بالبيانات</H2>
    <Ul>
      <li>
        يتم الاحتفاظ بالصور والنتائج طالما كان حسابك نشطًا، أو حتى تقوم بحذفها (المعرض ←
        حذف).
      </li>
      <li>
        عند حذف الحساب، يتم حذف صورك ونتائجك وبياناتك الشخصية نهائيًا خلال 30 يومًا، باستثناء
        السجلات التي يلزمنا القانون بالاحتفاظ بها (مثل السجلات المالية المرتبطة بطلب مكتمل).
      </li>
    </Ul>

    <H2>١٠. حقوقك (بموجب قانون حماية البيانات)</H2>
    <P>
      وفقًا لقانون حماية البيانات الشخصية، يحق لك الوصول إلى بياناتك وتصحيحها وتحديثها أو
      حذفها، والاعتراض على معالجتها أو تقييدها، وسحب موافقتك، وطلب نقل بياناتك. يمكنك حذف
      حسابك من داخل التطبيق (حسابي ← حذف الحساب) أو التواصل معنا. يمكنك أيضًا التقدم بشكوى
      لمركز حماية البيانات الشخصية في مصر.
    </P>

    <H2>١١. الأمان</H2>
    <P>
      نطبق إجراءات تقنية وتنظيمية تشمل التشفير أثناء النقل، وضوابط الوصول، وأمان قاعدة
      البيانات على مستوى الصف. لا يوجد نظام آمن بشكل مطلق، لكننا نعمل على حماية بياناتك
      وإخطارك والجهات المعنية بأي اختراق وفقًا لما يقتضيه القانون.
    </P>

    <H2>١٢. الأطفال</H2>
    <P>
      تطبيق لمحة غير موجّه للأطفال دون سن ١٨ عامًا. إذا كنت تعتقد أن طفلًا قد قدّم لنا
      بياناته، يُرجى التواصل معنا وسنقوم بحذفها.
    </P>

    <H2>١٣. التغييرات</H2>
    <P>
      قد نقوم بتحديث هذه السياسة؛ وسننشر تاريخ السريان الجديد، وفي حال التغييرات الجوهرية
      سنُخطرك داخل التطبيق.
    </P>

    <H2>١٤. التواصل</H2>
    <P>
      للأسئلة أو الطلبات: <strong>واتساب +20 106 027 0197</strong> · [البريد الإلكتروني
      للدعم] · [اسمك الكامل كما هو مسجل]، باسم تجاري "لمحة"، [العنوان المسجل]، مصر.
    </P>
  </>
)

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      titleEn="Privacy Policy"
      titleAr="سياسة الخصوصية"
      effectiveDateEn="[EFFECTIVE DATE]"
      effectiveDateAr="[تاريخ السريان]"
      contentEn={en}
      contentAr={ar}
    />
  )
}
