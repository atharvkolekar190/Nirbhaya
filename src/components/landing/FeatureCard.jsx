const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(79,70,229,0.12)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
