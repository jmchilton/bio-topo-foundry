#!/usr/bin/env bash
#SBATCH --job-name=hiponet-faithful
#SBATCH --time=06:00:00
#SBATCH --gpus=1
#SBATCH --cpus-per-task=4
#SBATCH --mem=64G
#SBATCH --array=0-4
#SBATCH --output=hiponet-faithful-%A_%a.log

set -euo pipefail

: "${FOUNDRY_ROOT:?Set FOUNDRY_ROOT to the absolute bio-topo-foundry checkout path}"
: "${HIPONET_ROOT:?Set HIPONET_ROOT to the absolute detached HiPoNet checkout path}"
: "${HIPONET_DATA_DIR:?Set HIPONET_DATA_DIR to the prepared melanoma_data_full path}"
: "${HIPONET_RESULTS_ROOT:?Set HIPONET_RESULTS_ROOT to an absolute output parent directory}"
: "${SLURM_ARRAY_TASK_ID:?Submit this script as the declared 0-4 Slurm array}"

hiponet_graph_features="${HIPONET_GRAPH_FEATURES:-released-diffusion}"
case "${hiponet_graph_features}" in
    released-diffusion|paper-wavelet) ;;
    *)
        echo "HIPONET_GRAPH_FEATURES must be released-diffusion or paper-wavelet" >&2
        exit 2
        ;;
esac

for required_path in \
    "${FOUNDRY_ROOT}" \
    "${HIPONET_ROOT}" \
    "${HIPONET_DATA_DIR}" \
    "${HIPONET_RESULTS_ROOT}"; do
    case "${required_path}" in
        /*) ;;
        *)
            echo "All configured paths must be absolute: ${required_path}" >&2
            exit 2
            ;;
    esac
done

if ((SLURM_ARRAY_TASK_ID < 0 || SLURM_ARRAY_TASK_ID > 4)); then
    echo "SLURM_ARRAY_TASK_ID must be between 0 and 4" >&2
    exit 2
fi

runner="${FOUNDRY_ROOT}/replications/hiponet/run_faithful.py"
run_id="faithful-seed-${SLURM_ARRAY_TASK_ID}"
output_dir="${HIPONET_RESULTS_ROOT}/${run_id}"

test -f "${runner}"
test -f "${HIPONET_DATA_DIR}/provenance.json"
test "$(basename "${HIPONET_DATA_DIR}")" = "melanoma_data_full"
command -v git >/dev/null
command -v uv >/dev/null
git -C "${HIPONET_ROOT}" rev-parse --git-dir >/dev/null
mkdir -p "${HIPONET_RESULTS_ROOT}"

export OMP_NUM_THREADS="${SLURM_CPUS_PER_TASK:-4}"

echo "run_id=${run_id}"
echo "host=$(hostname)"
echo "slurm_job_id=${SLURM_JOB_ID:-unknown}"
echo "slurm_array_job_id=${SLURM_ARRAY_JOB_ID:-unknown}"
echo "slurm_array_task_id=${SLURM_ARRAY_TASK_ID}"
echo "graph_features=${hiponet_graph_features}"
nvidia-smi

cd "${HIPONET_ROOT}"
uv run --locked python "${runner}" \
    --hiponet-root "${HIPONET_ROOT}" \
    --data-dir "${HIPONET_DATA_DIR}" \
    --run-id "${run_id}" \
    --output-dir "${output_dir}" \
    --graph-features "${hiponet_graph_features}"
