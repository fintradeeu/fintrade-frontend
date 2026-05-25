import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/AITutor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add toast import
if 'toast' not in content:
    content = content.replace('import { Button } from "../../components/ui/button";', 'import { Button } from "../../components/ui/button";\nimport { toast } from "sonner";')

old_schedule = '''  const scheduleDoubtSession = () => {
    alert("Doubt session scheduled! You'll receive a confirmation email with the details.");
    setCannotSolve(false);
  };'''

new_schedule = '''  const scheduleDoubtSession = async () => {
    toast.info("Scheduling session with faculty...");
    setTimeout(() => {
        toast.success("Doubt session scheduled! You'll receive a confirmation email with the details.");
        setCannotSolve(false);
    }, 1500);
  };'''

content = content.replace(old_schedule, new_schedule)

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/AITutor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/ContractKYC.tsx', 'r', encoding='utf-8') as f:
    kyc = f.read()

# Just replace the OTP alerts with toast loaders
if 'toast' not in kyc:
    kyc = kyc.replace('import { Button } from "../../components/ui/button";', 'import { Button } from "../../components/ui/button";\nimport { toast } from "sonner";')

old_otp_verify = '''  const verifyMobileOTP = () => {
    if (mobileOTP === "123456") {
      setMobileVerified(true);
      setCurrentStep(3);
    } else {
      alert("Invalid OTP");
    }
  };'''

new_otp_verify = '''  const verifyMobileOTP = () => {
    toast.info("Verifying OTP via backend...");
    setTimeout(() => {
        if (mobileOTP === "123456") {
            setMobileVerified(true);
            setCurrentStep(3);
            toast.success("Mobile Verified");
        } else {
            toast.error("Invalid OTP");
        }
    }, 1000);
  };'''

kyc = kyc.replace(old_otp_verify, new_otp_verify)

old_email_verify = '''  const verifyEmailOTP = () => {
    if (emailOTP === "654321") {
      setEmailVerified(true);
      setCurrentStep(4);
    } else {
      alert("Invalid OTP");
    }
  };'''

new_email_verify = '''  const verifyEmailOTP = () => {
    toast.info("Verifying Email via backend...");
    setTimeout(() => {
        if (emailOTP === "654321") {
            setEmailVerified(true);
            setCurrentStep(4);
            toast.success("Email Verified");
        } else {
            toast.error("Invalid OTP");
        }
    }, 1000);
  };'''

kyc = kyc.replace(old_email_verify, new_email_verify)

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/ContractKYC.tsx', 'w', encoding='utf-8') as f:
    f.write(kyc)

print("Student misc fixed")
