// Utility functions for MotmaenBash extension

async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getTypeName(type) {
  switch (type) {
    case 1: return 'فشینیگ';
    case 2: return 'کلاه‌برداری';
    case 3: return 'پانزی';
    case 4: return 'دیگر';
    default: return 'ناشناخته';
  }
}

function getLevelName(level) {
  switch (level) {
    case 1: return 'خطر';
    case 2: return 'هشدار';
    case 3: return 'خنثی';
    case 4: return 'اطلاعات';
    default: return 'ناشناخته';
  }
}

function getSecurityMessage(result) {
  if (!result || typeof result !== 'object') {
    return {
      title: 'وضعیت نامشخص',
      text: 'اطلاعات کافی برای بررسی امنیت در دسترس نیست',
      icon: '/assets/images/icon_neutral.png',
      className: 'status_title_nok'
    };
  }

  if (result.secure === true) {
    return {
      title: 'درگاه پرداخت امن، مطمئن باش',
      text: 'این درگاه پرداخت معتبر و امن است',
      icon: '/assets/images/icon_ok.png',
      className: 'status_title_ok'
    };
  } else if (result.secure === false) {
    const type = typeof result.type === 'number' ? result.type : 0;
    const level = typeof result.level === 'number' ? result.level : 0;

    const typeName = getTypeName(type);
    const levelName = getLevelName(level);

    let title, text;

    switch (type) {
      case 1:
        title = 'هشدار: درگاه پرداخت جعلی';
        text = 'این درگاه پرداخت جعلی است و قصد سرقت اطلاعات شما را دارد';
        break;
      case 2:
        title = 'هشدار: کلاهبرداری';
        text = 'این سایت با هدف کلاهبرداری ایجاد شده است';
        break;
      case 3:
        title = 'هشدار: طرح پانزی';
        text = 'این سایت مرتبط با طرح‌های پانزی و کلاهبرداری مالی است';
        break;
      default:
        title = 'هشدار: سایت مشکوک';
        text = 'این سایت در لیست سایت‌های مشکوک قرار دارد';
    }

    return {
      title: title,
      text: text,
      icon: '/assets/images/icon_danger.png',
      className: 'status_title_danger',
      type: typeName,
      level: levelName
    };
  } else {
    return {
      title: 'این صفحه یک درگاه پرداخت نیست',
      text: 'تنها در صورت مشاهده تیک سبز رنگ، مطمئن باش که یک درگاه امن و معتبر است',
      icon: '/assets/images/icon_128.png',
      className: 'status_title_nok'
    };
  }
}
