# 📌 دليل كتابة التقارير الفنية للمشروع

## ✅ **هيكل التقرير المثالي**  
كل تقرير يجب أن يكون منظمًا باستخدام التنسيق التالي:

```
// src/<المسار الكامل للملف>
<الكود الخاص بالملف>
```

### **🔹 مثال على تقرير جيد:**
```
// src/application/auth/services/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from './jwt.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({ ...registerDto, password: hashedPassword });
    await this.usersRepository.save(user);
    return { message: 'User registered successfully' };
  }
}
```

### **🔹 مثال على تقرير غير منظم (يجب تجنبه)**:
```typescript
// هذا التقرير غير واضح لأنه لا يحدد أي ملف يجب تعديل هذا الكود فيه
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async register(dto) {
    return 'User created';
  }
}
```

---

## 📌 **تصنيف المشكلات حسب الأولوية**

1️⃣ **مشكلات تؤثر على تشغيل التطبيق:**  
   - غياب الملفات الحرجة (`AuthService`, `JwtService`).  
   - عدم تحميل الوحدات (`app.module.ts` لا يحتوي على `AuthModule`).  

2️⃣ **تحسينات هيكلية:**  
   - نقل الملفات إلى مسارات منظمة (`repositories/`, `dto/`, `entities/`).  
   - تحسين بنية البيانات (`store.entity.ts` يحتاج إلى `owner: UserEntity`).  

3️⃣ **تحسينات إضافية:**  
   - إضافة `Swagger` لتوثيق الـ API.  
   - تحسين `AuthService` لدعم `refreshToken`.  
   - تطبيق `class-validator` لضمان صحة البيانات.  

---

## 🛠 **كيفية التحقق من صحة التقرير قبل إرساله**:
✅ تأكد من أن كل كود موجود داخل ملف محدد بوضوح (`// src/...`).  
✅ تأكد من أن المشكلة مذكورة بوضوح في بداية التقرير.  
✅ تأكد من أن الحل المقترح يتبع نفس نمط الكود الموجود بالفعل في المشروع.  

🚀 **إذا تم اتباع هذه الإرشادات، سيتمكن النظام من تنفيذ التعديلات بسرعة ودقة!**  
