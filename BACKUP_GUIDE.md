# BS Attendance System - Source Code Backup Guide

## آپ کے Source Code کو محفوظ رکھنے کے طریقے

### 1. GitHub Repository (سب سے بہتر)
```bash
# Terminal میں یہ commands چلائیں:
git init
git add .
git commit -m "Initial commit - BS Attendance System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bs-attendance-system.git
git push -u origin main
```

### 2. Manual File Backup
یہ files کو اپنے computer پر save کریں:

#### Core Application Files:
- `src/App.tsx` - Main application
- `src/components/` - تمام components
- `src/utils/` - Utility functions
- `src/types/` - TypeScript types
- `package.json` - Dependencies
- `vite.config.ts` - Build configuration

#### Important Configuration Files:
- `tailwind.config.js`
- `tsconfig.json`
- `index.html`

### 3. Cloud Storage Options
- **Google Drive**: تمام files کو zip کر کے upload کریں
- **Dropbox**: Folder sync کریں
- **OneDrive**: Microsoft account سے sync کریں

### 4. Version Control Best Practices
```bash
# Regular commits کریں:
git add .
git commit -m "Added new feature"
git push origin main

# Branches بنائیں features کے لیے:
git checkout -b new-feature
git checkout main
git merge new-feature
```

### 5. Automated Backup Script
```javascript
// package.json میں script add کریں:
{
  "scripts": {
    "backup": "zip -r backup-$(date +%Y%m%d).zip src/ public/ package.json"
  }
}
```

### 6. Environment Variables
`.env` file بنائیں sensitive data کے لیے:
```
VITE_APP_NAME=BS Attendance System
VITE_BACKUP_EMAIL=jahangirkhan9279925@gmail.com
```

## Deployment URLs
- **Live Site**: https://courageous-dieffenbachia-34bf1f.netlify.app
- **Netlify Claim**: Use the claim URL to transfer to your account

## Contact Information
- **Developer Email**: jahangirkhan9279925@gmail.com
- **Project**: BS Student Attendance System
- **Technology**: React + TypeScript + Tailwind CSS

## Recovery Instructions
اگر code lost ہو جائے تو:
1. GitHub repository سے clone کریں
2. Netlify سے source download کریں
3. Local backup سے restore کریں

## Security Notes
- Passwords کو code میں hardcode نہ کریں
- Environment variables استعمال کریں
- Regular backups لیں
- Version control استعمال کریں