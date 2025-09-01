import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Subscription from "@/pages/Subscription";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import MyPage from "@/pages/MyPage";
import HowItWorks from "@/pages/HowItWorks";
import Payment from "@/pages/Payment";
import PlantRecommendation from "@/pages/PlantRecommendation";
import PlantTips from "@/pages/PlantTips";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/plant-match" component={PlantRecommendation} />
      <Route path="/plant-tips" component={PlantTips} />
      <Route path="/payment" component={Payment} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/mypage" component={MyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
