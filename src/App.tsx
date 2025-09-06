import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProfileGender from "./pages/ProfileGender";
import ProfileAge from "./pages/ProfileAge";
import ProfileAppearance from "./pages/ProfileAppearance";
import ProfileMorphologyPreferences from "./pages/ProfileMorphologyPreferences";
import ProfileSkinColor from "./pages/ProfileSkinColor";
import ProfileSkinColorPreferences from "./pages/ProfileSkinColorPreferences";
import ProfileLocation from "./pages/ProfileLocation";
import ProfileDistance from "./pages/ProfileDistance";
import ProfileInterests from "./pages/ProfileInterests";
import ProfileTargetAge from "./pages/ProfileTargetAge";
import ProfileHeight from "./pages/ProfileHeight";
import ProfileHeightPreferences from "./pages/ProfileHeightPreferences";
import ProfileHeightConfirmation from "./pages/ProfileHeightConfirmation";
import ProfileObjectives from "./pages/ProfileObjectives";
import ProfilePersonality from "./pages/ProfilePersonality";
import ProfileArchetype from "./pages/ProfileArchetype";
import ProfileArchetypePreferences from "./pages/ProfileArchetypePreferences";
import ProfileAppearanceImportance from "./pages/ProfileAppearanceImportance";
import ProfileVisibility from "./pages/ProfileVisibility";
import ProfileComplete from "./pages/ProfileComplete";
import ProfileCrush from "./pages/ProfileCrush";
import ProfilePhotoUpload from "./pages/ProfilePhotoUpload";
import TemporaryMessage from "./pages/TemporaryMessage";

import SplashScreen from "./pages/SplashScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/splash-screen" element={<SplashScreen />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-gender" element={<ProfileGender />} />
            <Route path="/profile-photo-upload" element={<ProfilePhotoUpload />} />
           <Route path="/profile-age" element={<ProfileAge />} />
          <Route path="/profile-appearance" element={<ProfileAppearance />} />
          <Route path="/profile-morphology-preferences" element={<ProfileMorphologyPreferences />} />
          <Route path="/profile-skin-color" element={<ProfileSkinColor />} />
          <Route path="/profile-skin-color-preferences" element={<ProfileSkinColorPreferences />} />
          <Route path="/profile-location" element={<ProfileLocation />} />
          <Route path="/profile-distance" element={<ProfileDistance />} />
          <Route path="/profile-objectives" element={<ProfileObjectives />} />
          <Route path="/profile-personality" element={<ProfilePersonality />} />
          <Route path="/profile-archetype" element={<ProfileArchetype />} />
          <Route path="/profile-archetype-preferences" element={<ProfileArchetypePreferences />} />
          <Route path="/profile-appearance-importance" element={<ProfileAppearanceImportance />} />
          <Route path="/profile-visibility" element={<ProfileVisibility />} />
          <Route path="/profile-complete" element={<ProfileComplete />} />
          <Route path="/profile-crush" element={<ProfileCrush />} />
          <Route path="/temporary-message" element={<TemporaryMessage />} />
          
          <Route path="/profile-interests" element={<ProfileInterests />} />
          <Route path="/profile-target-age" element={<ProfileTargetAge />} />
          <Route path="/profile-height" element={<ProfileHeight />} />
          <Route path="/profile-height-preferences" element={<ProfileHeightPreferences />} />
          <Route path="/profile-height-confirmation" element={<ProfileHeightConfirmation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
