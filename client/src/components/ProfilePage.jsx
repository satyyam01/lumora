import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { User, Mail, Edit3, Trash2, Loader2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [editingDob, setEditingDob] = useState(false);
  const [newDob, setNewDob] = useState("");
  const [dobLoading, setDobLoading] = useState(false);
  const [dobError, setDobError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleEditName = () => {
    setEditingName(true);
    setNewName(profile.name);
    setNameError("");
  };
  const handleCancelName = () => {
    setEditingName(false);
    setNewName("");
    setNameError("");
  };
  const handleSaveName = async () => {
    setNameLoading(true);
    setNameError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/profile/name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update name");
      setProfile(data.profile);
      setEditingName(false);
      setNewName("");
    } catch (err) {
      setNameError(err.message);
    } finally {
      setNameLoading(false);
    }
  };

  const handleEditEmail = () => {
    setEditingEmail(true);
    setNewEmail("");
    setEmailError("");
    setOtpStep(false);
    setOtp("");
    setOtpError("");
  };
  const handleCancelEmail = () => {
    setEditingEmail(false);
    setNewEmail("");
    setEmailError("");
    setOtpStep(false);
    setOtp("");
    setOtpError("");
  };
  const handleRequestEmailOtp = async () => {
    setEmailLoading(true);
    setEmailError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/profile/email/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpStep(true);
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };
  const handleVerifyEmailOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/profile/email/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      setProfile(data.profile);
      setEditingEmail(false);
      setNewEmail("");
      setOtpStep(false);
      setOtp("");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEditDob = () => {
    setEditingDob(true);
    setNewDob(profile.dob ? profile.dob.slice(0, 10) : "");
    setDobError("");
  };
  const handleCancelDob = () => {
    setEditingDob(false);
    setNewDob("");
    setDobError("");
  };
  const handleSaveDob = async () => {
    setDobLoading(true);
    setDobError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/profile/dob", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dob: newDob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update DOB");
      setProfile(data.profile);
      setEditingDob(false);
      setNewDob("");
    } catch (err) {
      setDobError(err.message);
    } finally {
      setDobLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete account");
      // Log out and redirect
      localStorage.removeItem("token");
      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <User className="w-7 h-7 text-violet-500" />
            <span>My Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-gray-400" />
              <span>Name</span>
            </Label>
            <div className="flex items-center space-x-3">
              {editingName ? (
                <>
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1"
                    disabled={nameLoading}
                  />
                  <Button onClick={handleSaveName} disabled={nameLoading || newName.length < 2} size="sm">
                    {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button onClick={handleCancelName} variant="outline" size="sm" disabled={nameLoading}>Cancel</Button>
                </>
              ) : (
                <>
                  <Input value={profile.name} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={handleEditName}>Edit</Button>
                </>
              )}
            </div>
            {nameError && <div className="text-xs text-red-500 mt-1">{nameError}</div>}
          </div>
          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Email</span>
            </Label>
            <div className="flex items-center space-x-3">
              {editingEmail ? (
                <>
                  <Input
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="flex-1"
                    disabled={emailLoading || otpStep}
                  />
                  {!otpStep ? (
                    <>
                      <Button onClick={handleRequestEmailOtp} disabled={emailLoading || !newEmail.includes('@')} size="sm">
                        {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                      </Button>
                      <Button onClick={handleCancelEmail} variant="outline" size="sm" disabled={emailLoading}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Input
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter OTP"
                        maxLength={6}
                        className="w-32"
                        disabled={otpLoading}
                      />
                      <Button onClick={handleVerifyEmailOtp} disabled={otpLoading || otp.length !== 6} size="sm">
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                      </Button>
                      <Button onClick={handleCancelEmail} variant="outline" size="sm" disabled={otpLoading}>Cancel</Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Input value={profile.email} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={handleEditEmail}>Change</Button>
                </>
              )}
            </div>
            {emailError && <div className="text-xs text-red-500 mt-1">{emailError}</div>}
            {otpError && <div className="text-xs text-red-500 mt-1">{otpError}</div>}
          </div>
          {/* DOB and Age */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Date of Birth</span>
            </Label>
            <div className="flex items-center space-x-3">
              {editingDob ? (
                <>
                  <Input
                    type="date"
                    value={newDob}
                    onChange={e => setNewDob(e.target.value)}
                    className="w-48"
                    disabled={dobLoading}
                  />
                  <Button onClick={handleSaveDob} disabled={dobLoading || !newDob} size="sm">
                    {dobLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button onClick={handleCancelDob} variant="outline" size="sm" disabled={dobLoading}>Cancel</Button>
                </>
              ) : (
                <>
                  <Input value={profile.dob ? profile.dob.slice(0, 10) : ""} readOnly className="w-48" />
                  <Button variant="outline" size="sm" onClick={handleEditDob}>Edit</Button>
                </>
              )}
              <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">Age: <span className="font-semibold">{calculateAge(profile.dob)}</span></span>
            </div>
            {dobError && <div className="text-xs text-red-500 mt-1">{dobError}</div>}
          </div>
          {/* Delete Account */}
          <div className="mt-8">
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
            {showDeleteDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full">
                  <h2 className="text-lg font-semibold mb-2">Delete Account?</h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">This will permanently delete your account and all associated data. This action cannot be undone.</p>
                  {deleteError && <div className="text-xs text-red-500 mb-2">{deleteError}</div>}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteLoading}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
                      {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 