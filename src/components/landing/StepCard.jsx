const StepCard = ({ step, title, description, isLast = false }) => {
  return (
    <div className="relative flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {!isLast && (
        <div className="absolute -right-3 top-1/2 hidden h-px w-10 -translate-y-1/2 bg-slate-200 lg:block" />
      )}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
};

export default StepCard;
